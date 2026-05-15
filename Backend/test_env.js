require('dotenv').config();
console.log('KEY present:', !!process.env.NEXT_PUBLIC_TWELVE_DATA_KEY);
console.log('KEY length:', (process.env.NEXT_PUBLIC_TWELVE_DATA_KEY || '').length);
console.log('KEY first 8:', (process.env.NEXT_PUBLIC_TWELVE_DATA_KEY || '').slice(0,8));
