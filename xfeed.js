const Parser = require('rss-parser');
const parser = new Parser();

const FEED_URL = 'https://rss.app/feeds/QclRoRXROG6UOibL.xml';
const CHANNEL_ID = '1366138640710893691';

let latestGUID = null;

module.exports = function startXFeed(client) {
  setInterval(async () => {
    try {
      const feed = await parser.parseURL(FEED_URL);
      if (!feed || !feed.items || feed.items.length === 0) return;

      const latest = feed.items[0];
      if (latestGUID === latest.guid) return;
      latestGUID = latest.guid;

      const channel = await client.channels.fetch(CHANNEL_ID);
      await channel.send(`📢 New Post\n${latest.link}`);
      console.log('[XFEED] ✔️ Yeni tweet linki gönderildi.');
    } catch (err) {
      console.error('[XFEED] ❌ Hata:', err.message);
    }
  }, 60000); // 1 dakikada bir kontrol
};
