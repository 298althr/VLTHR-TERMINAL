const ingestion = require('./services/ingestion');
require('dotenv').config();

async function testSync() {
  console.log('Testing Full Sync Cycle from Backend...');
  try {
    await ingestion.syncAll();
    console.log('Full Sync Cycle complete in test script.');
  } catch (e) {
    console.error('Sync failed:', e);
  }
}

testSync();
