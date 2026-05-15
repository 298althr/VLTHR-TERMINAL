const axios = require('axios');
const crypto = require('crypto');

// In-memory store for passcodes (in production, use Redis or a DB)
const passcodes = new Map();

module.exports = {
  generatePasscode: async () => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      console.error('[AUTH] Telegram credentials missing. TOKEN:', !!token, 'CHAT_ID:', !!chatId);
      return { success: false, error: 'Auth system misconfigured' };
    }

    const code = crypto.randomInt(100000, 999999).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 mins expiry

    passcodes.set(code, expiry);

    // Send to Telegram
    try {
      console.log(`[AUTH] Attempting to send code to Telegram Chat ID: ${chatId}`);
      const response = await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: chatId,
        text: `🔐 *VLTHR Terminal Login Code*\n\nYour temporary passcode is: \`${code}\`\n\nExpires in 5 minutes.`,
        parse_mode: 'Markdown'
      }, {
        timeout: 15000 // Increase timeout to 15s for this specific call
      });
      
      if (response.data && response.data.ok) {
        console.log(`[AUTH] Passcode generated and sent to Telegram successfully.`);
        return { success: true };
      } else {
        console.error('[AUTH] Telegram API returned error:', response.data);
        return { success: false, error: 'Telegram API error' };
      }
    } catch (e) {
      if (e.response) {
        console.error('[AUTH] Telegram API responded with error:', e.response.status, e.response.data);
      } else if (e.request) {
        console.error('[AUTH] No response from Telegram API. Request details:', e.config.url);
      } else {
        console.error('[AUTH] Telegram send failed:', e.message);
      }
      return { success: false, error: 'Failed to send notification' };
    }
  },

  verifyPasscode: (code) => {
    const expiry = passcodes.get(code);
    if (!expiry) return false;

    if (Date.now() > expiry) {
      passcodes.delete(code);
      return false;
    }

    // Single use code
    passcodes.delete(code);
    return true;
  }
};
