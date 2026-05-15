const parquet = require('parquetjs-lite');
const path = require('path');
const fs = require('fs');

/**
 * ParquetEngine (Retina Edition)
 * Handles hierarchical partitioning for high-performance financial data.
 */

const DATA_ROOT = process.env.DATA_ROOT || path.join(__dirname, '../../data');

const SCHEMA = new parquet.ParquetSchema({
  timestamp: { type: 'INT64' },
  open: { type: 'DOUBLE' },
  high: { type: 'DOUBLE' },
  low: { type: 'DOUBLE' },
  close: { type: 'DOUBLE' },
  volume: { type: 'DOUBLE' },
  source: { type: 'UTF8' },
  is_verified: { type: 'BOOLEAN' },
  checksum: { type: 'UTF8' }
});

module.exports = {
  /**
   * Saves history with hierarchical partitioning.
   */
  saveHistory: async (category, symbol, timeframe, points, source = 'unknown') => {
    // Sanitize symbol for filesystem paths (e.g. BTC/USD -> BTC_USD)
    const safeSymbol = symbol.replace(/\//g, '_');
    // 1. Calculate Partition Key
    let partitionKey = 'history';
    const now = new Date();
    
    if (timeframe === '1m' || timeframe === '5m') {
      partitionKey = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}`;
    } else if (timeframe === '1h') {
      const quarter = Math.floor(now.getMonth() / 3) + 1;
      partitionKey = `${now.getFullYear()}_Q${quarter}`;
    }

    // 2. Ensure Directory Hierarchy
    const dir = path.join(DATA_ROOT, category, safeSymbol, timeframe);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, `${partitionKey}.parquet`);
    
    // 3. Write Data
    try {
      const writer = await parquet.ParquetWriter.openFile(SCHEMA, filePath);
      for (const p of points) {
        await writer.appendRow({
          timestamp: BigInt(p.t),
          open: parseFloat(p.o),
          high: parseFloat(p.h),
          low: parseFloat(p.l),
          close: parseFloat(p.c),
          volume: parseFloat(p.v || 0),
          source: source,
          is_verified: true,
          checksum: 'v1_sha256_placeholder'
        });
      }
      await writer.close();
      console.log(`[ParquetEngine] Partitioned: ${points.length} bars -> ${category}/${safeSymbol}/${timeframe}/${partitionKey}.parquet`);
    } catch (e) {
      console.error(`[ParquetEngine] Write Failed for ${symbol}:`, e.message);
    }
  },

  /**
   * Reads history from the correct partition.
   */
  readHistory: async (category, symbol, timeframe) => {
    // Sanitize symbol for filesystem paths
    const safeSymbol = symbol.replace(/\//g, '_');
    // For now, we'll read the 'latest' partition or 'history'
    const now = new Date();
    let partitionKey = 'history';
    if (timeframe === '1m' || timeframe === '5m') {
      partitionKey = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, '0')}`;
    } else if (timeframe === '1h') {
      const quarter = Math.floor(now.getMonth() / 3) + 1;
      partitionKey = `${now.getFullYear()}_Q${quarter}`;
    }

    const filePath = path.join(DATA_ROOT, category, safeSymbol, timeframe, `${partitionKey}.parquet`);
    if (!fs.existsSync(filePath)) return null;

    try {
      const reader = await parquet.ParquetReader.openFile(filePath);
      const cursor = reader.getCursor();
      const rows = [];
      let record = null;
      while (record = await cursor.next()) {
        rows.push({
          t: Number(record.timestamp),
          o: record.open,
          h: record.high,
          l: record.low,
          c: record.close,
          v: record.volume
        });
      }
      await reader.close();
      return rows;
    } catch (e) {
      console.error(`[ParquetEngine] Read Failed for ${symbol}:`, e.message);
      return null;
    }
  }
};
