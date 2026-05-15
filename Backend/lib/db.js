const fs = require('fs');
const path = require('path');

const DATA_DIR = process.env.DATA_ROOT || '/app/data';
const DB_PATH = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize DB if not exists
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({
    portfolio: [],
    alerts: [],
    settings: { baseCurrency: 'USD' }
  }, null, 2));
}

module.exports = {
  read: () => {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  },

  write: (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  },

  update: (key, value) => {
    const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    db[key] = value;
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  }
};
