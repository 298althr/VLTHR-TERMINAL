const parquet = require('parquetjs-lite');
const path = require('path');
const fs = require('fs');

/**
 * SnapshotParquet Engine
 * Handles storage and retrieval of market snapshots (prices, changes, caps) partitioned by category and hour.
 */

const DATA_ROOT = path.join(process.env.DATA_ROOT || path.join(__dirname, '../data'), 'snapshots');

const SCHEMA = new parquet.ParquetSchema({
  symbol: { type: 'UTF8' },
  price: { type: 'DOUBLE' },
  change_1d: { type: 'DOUBLE' },
  change_pct: { type: 'DOUBLE' },
  market_cap: { type: 'DOUBLE' },
  volume: { type: 'DOUBLE' },
  category: { type: 'UTF8' },
  fetched_at: { type: 'INT64' }
});

module.exports = {
  /**
   * Saves a category snapshot.
   */
  saveSnapshot: async (category, items) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const hourStr = String(now.getHours()).padStart(2, '0');
    
    const dir = path.join(DATA_ROOT, category);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, `${dateStr}_${hourStr}.parquet`);
    
    try {
      const writer = await parquet.ParquetWriter.openFile(SCHEMA, filePath);
      for (const item of items) {
        await writer.appendRow({
          symbol: String(item.symbol),
          price: parseFloat(item.price || 0),
          change_1d: parseFloat(item.change_1d || 0),
          change_pct: parseFloat(item.change_pct || 0),
          market_cap: parseFloat(item.market_cap || 0),
          volume: parseFloat(item.volume || 0),
          category: String(category),
          fetched_at: BigInt(now.getTime())
        });
      }
      await writer.close();
      console.log(`[SnapshotParquet] Saved ${items.length} items to ${category}/${dateStr}_${hourStr}.parquet`);
      return true;
    } catch (e) {
      console.error(`[SnapshotParquet] Save Failed for ${category}:`, e.message);
      return false;
    }
  },

  /**
   * Reads the latest available snapshot for a category.
   */
  readLatestSnapshot: async (category) => {
    const dir = path.join(DATA_ROOT, category);
    if (!fs.existsSync(dir)) return null;

    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith('.parquet'))
      .sort((a, b) => b.localeCompare(a)); // Reverse sort for latest

    if (files.length === 0) return null;

    const filePath = path.join(dir, files[0]);

    try {
      const reader = await parquet.ParquetReader.openFile(filePath);
      const cursor = reader.getCursor();
      const items = [];
      let record = null;
      while (record = await cursor.next()) {
        items.push({
          symbol: record.symbol,
          price: record.price,
          change_1d: record.change_1d,
          change_pct: record.change_pct,
          market_cap: record.market_cap,
          volume: record.volume,
          category: record.category,
          fetchedAt: Number(record.fetched_at)
        });
      }
      await reader.close();
      return items;
    } catch (e) {
      console.error(`[SnapshotParquet] Read Failed for ${category}:`, e.message);
      return null;
    }
  }
};
