const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_KEY = 'd235914a48b7ee0d3ee562eff6673cd78743f85d7ac427ed5b930f8610241e08';
const SEARCH_URL = 'https://api.macosicons.com/api/v1/search';

const appIconsToFetch = [
  { id: 'crypto', query: 'bitcoin', category: 'rq2vNGoV92' },
  { id: 'forex', query: 'safari', category: 'qI4GKWNpum' },
  { id: 'equities', query: 'stocks', category: 'rq2vNGoV92' },
  { id: 'news', query: 'news', category: 'jQbEVy2jCI' },
  { id: 'macro', query: 'bank', category: 'rq2vNGoV92' },
  { id: 'calendar', query: 'calendar', category: 'joml1zA4lv' },
  { id: 'options', query: 'terminal', category: 'm2v3VuzZEu' },
  { id: 'watchlist', query: 'star', category: '7KYFn5kd15' },
  { id: 'screener', query: 'search', category: 'EzBFwmxpNd' },
  { id: 'risklab', query: 'shield', category: 'EzBFwmxpNd' },
  { id: 'signals', query: 'bolt', category: 'EzBFwmxpNd' },
  { id: 'portfolio', query: 'wallet', category: 'rq2vNGoV92' },
  { id: 'concierge', query: 'siri', category: 'StBWAxgpbs' },
  { id: 'reports', query: 'folder', category: 'joml1zA4lv' },
  { id: 'settings', query: 'settings', category: 'EzBFwmxpNd' },
  { id: 'lock', query: 'lock', category: 'EzBFwmxpNd' }
];

async function fetchAndDownload() {
  const iconsDir = path.join(__dirname, '../VLTHR/public/icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  for (const app of appIconsToFetch) {
    try {
      const filePath = path.join(iconsDir, `${app.id}.png`);
      
      // Protection: Skip if icon already exists to save API credits
      if (fs.existsSync(filePath)) {
        console.log(`[SKIP] Icon for ${app.id} already exists at ${filePath}`);
        continue;
      }

      console.log(`Searching for ${app.id} (${app.query})...`);
      const response = await axios.post(SEARCH_URL, {
        query: app.query,
        searchOptions: {
          hitsPerPage: 10,
          page: 1,
          filters: [
            `category = ${app.category}`
          ],
          sort: ["downloads:desc"]
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        }
      });

      if (response.data.hits && response.data.hits.length > 0) {
        // Find a good match that is a PNG (easier to use than ICNS in browser)
        let hit = response.data.hits.find(h => h.lowResPngUrl || h.iOSUrl);
        if (!hit) hit = response.data.hits[0];
        
        const url = hit.lowResPngUrl || hit.iOSUrl || hit.icnsUrl; 
        
        if (url) {
          const extension = '.png'; // Force png extension for simplicity
          const filePath = path.join(iconsDir, `${app.id}${extension}`);
          
          console.log(`Downloading ${app.id} from ${url}...`);
          try {
            const downloadResponse = await axios.get(url, { 
                responseType: 'stream',
                timeout: 10000 
            });
            const writer = fs.createWriteStream(filePath);
            downloadResponse.data.pipe(writer);
            
            await new Promise((resolve, reject) => {
              writer.on('finish', resolve);
              writer.on('error', reject);
            });
            console.log(`Saved ${app.id}${extension}`);
          } catch (dlError) {
            console.error(`Failed to download ${app.id} from ${url}:`, dlError.message);
          }
        }
      } else {
        // Try without category filter if no hits
        console.warn(`No icons found for ${app.query} in category ${app.category}, retrying without category...`);
        const response2 = await axios.post(SEARCH_URL, {
            query: app.query,
            searchOptions: {
              hitsPerPage: 5,
              page: 1,
              sort: ["downloads:desc"]
            }
          }, {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': API_KEY
            }
          });
          if (response2.data.hits && response2.data.hits.length > 0) {
            const hit = response2.data.hits[0];
            const url = hit.lowResPngUrl || hit.iOSUrl || hit.icnsUrl;
            if (url) {
                const filePath = path.join(iconsDir, `${app.id}.png`);
                console.log(`Downloading ${app.id} (no category) from ${url}...`);
                const writer = fs.createWriteStream(filePath);
                const downloadResponse = await axios.get(url, { responseType: 'stream' });
                downloadResponse.data.pipe(writer);
                await new Promise((resolve, reject) => {
                  writer.on('finish', resolve);
                  writer.on('error', reject);
                });
                console.log(`Saved ${app.id}.png`);
            }
          }
      }
    } catch (error) {
      console.error(`Error fetching icon for ${app.id}:`, error.message);
    }
  }
}

fetchAndDownload();
