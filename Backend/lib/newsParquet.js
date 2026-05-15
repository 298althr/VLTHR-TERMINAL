const parquet = require('parquetjs-lite');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

/**
 * NewsParquet Engine — Enhanced
 *
 * Storage layout:  data/news/{category}/YYYY-MM.parquet
 * Index layout:    data/news/{category}/index.json
 *
 * Monthly partitioning keeps files manageable (~500–2000 articles each)
 * while supporting efficient range queries across 12 months.
 */

const _BASE = process.env.DATA_ROOT || path.join(__dirname, '../data');
const DATA_ROOT = path.join(_BASE, 'news');

const CATEGORIES = ['finance', 'stocks', 'crypto', 'tech', 'economy'];

// ─── Sentiment Lexicon ──────────────────────────────────────────────────────
const POSITIVE_WORDS = new Set([
  'gain', 'gains', 'surge', 'surges', 'rise', 'rises', 'rose', 'rally', 'rallies',
  'profit', 'profits', 'growth', 'bullish', 'beat', 'beats', 'record', 'strong',
  'strong', 'outperform', 'upgrade', 'upside', 'positive', 'recover', 'recovery',
  'boost', 'boosts', 'jump', 'jumped', 'soar', 'soared', 'climb', 'climbed',
  'expand', 'expansion', 'optimistic', 'confidence', 'opportunity', 'breakthrough',
  'prosper', 'prosperous', 'boom', 'rebound', 'uptrend', 'accelerate', 'success'
]);

const NEGATIVE_WORDS = new Set([
  'loss', 'losses', 'fall', 'falls', 'fell', 'drop', 'drops', 'crash', 'crashes',
  'decline', 'declines', 'bear', 'bearish', 'miss', 'missed', 'weak', 'weakness',
  'risk', 'risks', 'concern', 'concerns', 'sell', 'selloff', 'plunge', 'plunges',
  'slump', 'slumps', 'downgrade', 'downturn', 'recession', 'debt', 'deficit',
  'default', 'bankrupt', 'bankruptcy', 'layoff', 'layoffs', 'inflation', 'bubble',
  'volatility', 'uncertainty', 'slowdown', 'contraction', 'warning', 'crisis',
  'collapsed', 'collapse', 'tumble', 'tumbled', 'retreat', 'retreated'
]);

/**
 * Compute sentiment from title + summary text.
 * Returns { score: [-1 .. 1], label: 'positive'|'negative'|'neutral' }
 */
function computeSentiment(title = '', summary = '') {
  const text = `${title} ${summary}`.toLowerCase();
  const words = text.match(/\b\w+\b/g) || [];
  let pos = 0, neg = 0;
  for (const w of words) {
    if (POSITIVE_WORDS.has(w)) pos++;
    if (NEGATIVE_WORDS.has(w)) neg++;
  }
  const total = pos + neg || 1;
  const raw = (pos - neg) / total;
  const score = Math.max(-1, Math.min(1, raw));
  const label = score > 0.05 ? 'positive' : score < -0.05 ? 'negative' : 'neutral';
  return { score: parseFloat(score.toFixed(4)), label };
}

/**
 * QAQC — validates and scores an article for quality.
 * Returns { valid: bool, quality_score: 0..1, reason?: string }
 */
function qaqc(article) {
  const issues = [];
  if (!article.title || article.title.length < 10) issues.push('title_too_short');
  if (!article.url || !article.url.startsWith('http')) issues.push('invalid_url');
  if (!article.source) issues.push('missing_source');
  if (!article.publishedAt && !article.published_at) issues.push('missing_date');

  if (issues.length >= 2) return { valid: false, quality_score: 0, reason: issues.join(',') };

  // Score: 0.0 – 1.0 based on completeness
  let score = 0.5; // base
  if (article.summary && article.summary.length > 50) score += 0.2;
  if (article.imageUrl || article.image_url) score += 0.1;
  if ((article.tickers || []).length > 0) score += 0.1;
  if (article.title && article.title.length > 40) score += 0.1;

  return { valid: true, quality_score: parseFloat(Math.min(1, score).toFixed(2)) };
}

// ─── Parquet Schema ─────────────────────────────────────────────────────────
const SCHEMA = new parquet.ParquetSchema({
  id:              { type: 'UTF8' },
  title:           { type: 'UTF8' },
  summary:         { type: 'UTF8' },
  url:             { type: 'UTF8' },
  source:          { type: 'UTF8' },
  published_at:    { type: 'INT64' },
  category:        { type: 'UTF8' },
  tickers:         { type: 'UTF8' },  // JSON array string
  sentiment_label: { type: 'UTF8' },
  sentiment_score: { type: 'DOUBLE' },
  quality_score:   { type: 'DOUBLE' },
  word_count:      { type: 'INT32' },
  image_url:       { type: 'UTF8' },
  language:        { type: 'UTF8' }
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
function articleId(article) {
  const key = article.url || article.title || String(Date.now());
  return crypto.createHash('md5').update(key).digest('hex');
}

function yearMonth(dateStr) {
  return new Date(dateStr).toISOString().slice(0, 7); // 'YYYY-MM'
}

function filePath(category, ym) {
  return path.join(DATA_ROOT, category, `${ym}.parquet`);
}

function ensureDir(category) {
  const dir = path.join(DATA_ROOT, category);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

// ─── Index (JSON) ────────────────────────────────────────────────────────────
function indexPath(category) {
  return path.join(DATA_ROOT, category, 'index.json');
}

function readIndex(category) {
  const p = indexPath(category);
  if (!fs.existsSync(p)) return { category, months: {}, total: 0, updatedAt: null };
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); }
  catch { return { category, months: {}, total: 0, updatedAt: null }; }
}

function writeIndex(category, idx) {
  idx.updatedAt = new Date().toISOString();
  fs.writeFileSync(indexPath(category), JSON.stringify(idx, null, 2));
}

// ─── Core API ────────────────────────────────────────────────────────────────
module.exports = {
  CATEGORIES,
  computeSentiment,
  qaqc,

  /**
   * Save a batch of articles for a specific category+yearMonth.
   * Deduplicates against any existing file for that month.
   */
  saveNewsBatch: async (category, ym, rawArticles) => {
    ensureDir(category);
    const fp = filePath(category, ym);

    // --- Load existing IDs to deduplicate ---
    const existingIds = new Set();
    if (fs.existsSync(fp)) {
      try {
        const reader = await parquet.ParquetReader.openFile(fp);
        const cursor = reader.getCursor(['id']);
        let rec;
        while ((rec = await cursor.next())) existingIds.add(rec.id);
        await reader.close();
      } catch (e) {
        console.warn(`[NewsParquet] Could not read existing ${ym} for dedup:`, e.message);
      }
    }

    // --- QAQC + Sentiment + Dedup ---
    const rows = [];
    for (const raw of rawArticles) {
      const id = articleId(raw);
      if (existingIds.has(id)) continue;

      const check = qaqc(raw);
      if (!check.valid) continue;

      const dateStr = raw.publishedAt || raw.published_at || new Date().toISOString();
      const text = `${raw.title || ''} ${raw.summary || raw.description || ''}`;
      const { score, label } = computeSentiment(raw.title, raw.summary || raw.description);
      const wordCount = text.split(/\s+/).filter(Boolean).length;

      rows.push({
        id,
        title:           String(raw.title || '').slice(0, 500),
        summary:         String(raw.summary || raw.description || '').slice(0, 2000),
        url:             String(raw.url || ''),
        source:          String(raw.source || ''),
        published_at:    BigInt(new Date(dateStr).getTime()),
        category:        String(category),
        tickers:         JSON.stringify(raw.tickers || raw.entities?.map(e => e.symbol) || []),
        sentiment_label: label,
        sentiment_score: score,
        quality_score:   check.quality_score,
        word_count:      wordCount,
        image_url:       String(raw.imageUrl || raw.image_url || ''),
        language:        String(raw.language || 'en')
      });
    }

    if (rows.length === 0) {
      console.log(`[NewsParquet] No new articles to write for ${category}/${ym}`);
      return 0;
    }

    // --- Append-merge: read all + write merged file ---
    const allRows = [];
    if (fs.existsSync(fp)) {
      try {
        const reader = await parquet.ParquetReader.openFile(fp);
        const cursor = reader.getCursor();
        let rec;
        while ((rec = await cursor.next())) allRows.push(rec);
        await reader.close();
        fs.unlinkSync(fp); // remove so we can rewrite
      } catch (e) {
        console.warn(`[NewsParquet] Could not merge existing ${ym}:`, e.message);
      }
    }

    const merged = [...allRows, ...rows];

    const writer = await parquet.ParquetWriter.openFile(SCHEMA, fp);
    for (const row of merged) {
      // Cast types for safety when re-writing existing rows
      await writer.appendRow({
        id:              String(row.id),
        title:           String(row.title || ''),
        summary:         String(row.summary || ''),
        url:             String(row.url || ''),
        source:          String(row.source || ''),
        published_at:    BigInt(typeof row.published_at === 'bigint' ? row.published_at : Number(row.published_at)),
        category:        String(row.category || category),
        tickers:         String(row.tickers || '[]'),
        sentiment_label: String(row.sentiment_label || 'neutral'),
        sentiment_score: parseFloat(row.sentiment_score || 0),
        quality_score:   parseFloat(row.quality_score || 0.5),
        word_count:      parseInt(row.word_count || 0),
        image_url:       String(row.image_url || ''),
        language:        String(row.language || 'en')
      });
    }
    await writer.close();

    // --- Update index ---
    const idx = readIndex(category);
    if (!idx.months[ym]) idx.months[ym] = { count: 0, sources: [], sentimentBreakdown: {} };
    idx.months[ym].count = merged.length;
    idx.months[ym].sources = [...new Set(merged.map(r => r.source).filter(Boolean))].slice(0, 20);
    idx.months[ym].sentimentBreakdown = merged.reduce((acc, r) => {
      const l = r.sentiment_label || 'neutral';
      acc[l] = (acc[l] || 0) + 1;
      return acc;
    }, {});
    idx.total = Object.values(idx.months).reduce((s, m) => s + m.count, 0);
    writeIndex(category, idx);

    console.log(`[NewsParquet] ${category}/${ym}: +${rows.length} new (${merged.length} total)`);
    return rows.length;
  },

  /**
   * Reads news for a category. Defaults to today's month.
   * Optional: filter by exact date (YYYY-MM-DD).
   */
  readNews: async (category, date = null) => {
    // If a specific date requested, read only that month
    if (date) {
      const ym = yearMonth(date);
      const fp = filePath(category, ym);
      if (!fs.existsSync(fp)) return [];
      try {
        const reader = await parquet.ParquetReader.openFile(fp);
        const cursor = reader.getCursor();
        const articles = [];
        let rec;
        while ((rec = await cursor.next())) {
          const d = new Date(Number(rec.published_at)).toISOString().split('T')[0];
          if (d === date) articles.push(module.exports._deserialize(rec));
        }
        await reader.close();
        return articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
      } catch (e) {
        console.error(`[NewsParquet] Read Failed for ${category}/${ym}:`, e.message);
        return [];
      }
    }

    // No date — read across the last 3 months to get enough articles
    const toDate = new Date().toISOString().split('T')[0];
    const fromDate = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];
    const results = await module.exports.readNewsByRange(category, fromDate, toDate);
    return results;
  },

  /**
   * Read news across a date range. Returns merged + sorted array.
   */
  readNewsByRange: async (category, fromDate, toDate) => {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const months = [];

    const cur = new Date(from.getFullYear(), from.getMonth(), 1);
    while (cur <= to) {
      months.push(cur.toISOString().slice(0, 7));
      cur.setMonth(cur.getMonth() + 1);
    }

    const results = [];
    for (const ym of months) {
      const fp = filePath(category, ym);
      if (!fs.existsSync(fp)) continue;
      try {
        const reader = await parquet.ParquetReader.openFile(fp);
        const cursor = reader.getCursor();
        let rec;
        while ((rec = await cursor.next())) {
          const ts = Number(rec.published_at);
          if (ts >= from.getTime() && ts <= to.getTime()) {
            results.push(module.exports._deserialize(rec));
          }
        }
        await reader.close();
      } catch (e) {
        console.warn(`[NewsParquet] Range read failed for ${category}/${ym}:`, e.message);
      }
    }

    return results.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  },

  /**
   * Full-text search across all monthly files for a category.
   * Searches title + summary. Returns top N results.
   */
  searchNews: async (category, query, limit = 20) => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const dir = path.join(DATA_ROOT, category);
    if (!fs.existsSync(dir)) return [];

    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith('.parquet'))
      .sort((a, b) => b.localeCompare(a)); // newest first

    const results = [];
    for (const file of files) {
      if (results.length >= limit) break;
      try {
        const reader = await parquet.ParquetReader.openFile(path.join(dir, file));
        const cursor = reader.getCursor();
        let rec;
        while ((rec = await cursor.next()) && results.length < limit) {
          const text = `${rec.title} ${rec.summary}`.toLowerCase();
          const score = terms.filter(t => text.includes(t)).length / terms.length;
          if (score > 0) results.push({ ...module.exports._deserialize(rec), matchScore: score });
        }
        await reader.close();
      } catch (e) { /* skip bad files */ }
    }

    return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
  },

  /**
   * Internal deserializer from parquet row → JS object.
   */
  _deserialize: (rec) => ({
    id:             rec.id,
    title:          rec.title,
    summary:        rec.summary,
    url:            rec.url,
    source:         rec.source,
    publishedAt:    new Date(Number(rec.published_at)).toISOString(),
    category:       rec.category,
    tickers:        (() => { try { return JSON.parse(rec.tickers); } catch { return []; } })(),
    sentiment:      rec.sentiment_label,
    sentimentScore: rec.sentiment_score,
    qualityScore:   rec.quality_score,
    wordCount:      rec.word_count,
    imageUrl:       rec.image_url,
    language:       rec.language
  }),

  readIndex,
  writeIndex,
  ensureDir,
  yearMonth
};
