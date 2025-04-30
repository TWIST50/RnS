const Parser = require('rss-parser');
const { EmbedBuilder } = require('discord.js');

const parser = new Parser({
  customFields: {
    item: ['media:content']
  }
});

const FEED_URL = 'https://rss.app/feeds/QclRoRXROG6UOibL.xml'; // X RSS Feed
const CHANNEL_ID = '1366138640710893691'; // Discord kanal ID

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

      const embed = new EmbedBuilder()
        .setColor(0x1DA1F2)
        .setTitle('📢 New Tweet')
        .setURL(latest.link)
        .setDescription(`[View Tweet](${latest.link})`)
        .setTimestamp(new Date(latest.pubDate || Date.now()));

      // Embed'e görsel varsa ekle
      if (latest.enclosure?.url) {
        embed.setImage(latest.enclosure.url);
      }

      await channel.send({ embeds: [embed] });

      console.log('[XFEED] ✔️ Yeni tweet gönderildi:', latest.title);
    } catch (err) {
      console.error('[XFEED] ❌ Hata:', err.message);
    }
  }, 60 * 1000); // Her 1 dakikada bir kontrol et
};
