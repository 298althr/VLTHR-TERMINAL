const axios = require('axios');

const API_KEY = 'd235914a48b7ee0d3ee562eff6673cd78743f85d7ac427ed5b930f8610241e08';
const CATEGORIES_URL = 'https://api.macosicons.com/api/v1/search/getCategories';

async function getCategories() {
  try {
    const response = await axios.get(CATEGORIES_URL, {
      headers: {
        'x-api-key': API_KEY
      }
    });
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error fetching categories:', error.message);
  }
}

getCategories();
