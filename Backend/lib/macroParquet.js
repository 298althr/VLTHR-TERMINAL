const parquet = require('parquetjs-lite');
const path = require('path');
const fs = require('fs');

/**
 * MacroParquet Engine
 * Handles storage and retrieval of economic indicators partitioned by country and indicator.
 */

const DATA_ROOT = path.join(process.env.DATA_ROOT || path.join(__dirname, '../../data'), 'macro');

const SCHEMA = new parquet.ParquetSchema({
  timestamp: { type: 'INT64' },
  country: { type: 'UTF8' },
  indicator: { type: 'UTF8' },
  value: { type: 'DOUBLE' },
  label: { type: 'UTF8' }
});

module.exports = {
  /**
   * Saves macro indicator data points.
   */
  saveIndicator: async (country, indicator, points, label = '') => {
    const dir = path.join(DATA_ROOT, country);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const filePath = path.join(dir, `${indicator}.parquet`);
    
    try {
      const writer = await parquet.ParquetWriter.openFile(SCHEMA, filePath);
      for (const p of points) {
        await writer.appendRow({
          timestamp: BigInt(new Date(p.date || p.timestamp).getTime()),
          country: String(country),
          indicator: String(indicator),
          value: parseFloat(p.value),
          label: String(label || p.label || indicator)
        });
      }
      await writer.close();
      console.log(`[MacroParquet] Saved ${points.length} points to ${country}/${indicator}.parquet`);
      return true;
    } catch (e) {
      console.error(`[MacroParquet] Save Failed for ${country}/${indicator}:`, e.message);
      return false;
    }
  },

  /**
   * Reads macro indicator data.
   */
  readIndicator: async (country, indicator) => {
    const filePath = path.join(DATA_ROOT, country, `${indicator}.parquet`);
    if (!fs.existsSync(filePath)) return null;

    try {
      const reader = await parquet.ParquetReader.openFile(filePath);
      const cursor = reader.getCursor();
      const points = [];
      let record = null;
      let label = indicator;
      while (record = await cursor.next()) {
        label = record.label;
        points.push({
          date: new Date(Number(record.timestamp)).toISOString().split('T')[0],
          timestamp: Number(record.timestamp),
          value: record.value
        });
      }
      await reader.close();
      return { indicator: label, points: points.sort((a, b) => a.timestamp - b.timestamp) };
    } catch (e) {
      console.error(`[MacroParquet] Read Failed for ${country}/${indicator}:`, e.message);
      return null;
    }
  }
};
