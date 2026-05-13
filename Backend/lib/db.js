const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../db.json');

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
