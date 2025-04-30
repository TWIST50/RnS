const Parser = require('rss-parser');
const parser = new Parser();
const { EmbedBuilder } = require('discord.js');

const FEED_URL = 'https://rss.app/feeds/QclRoRXROG6UOibL.xml';
const CHANNEL_ID = '1366138640710893691';

let lastPosted = null;

module.exports = function startXFeed(client) {
    async function checkFeed() {
        try {
            const feed = await parser.parseURL(FEED_URL);
            if (!feed || !feed.items || feed.items.length === 0) return;

            const latest = feed.items[0];

            if (lastPosted !== latest.link) {
                const channel = await client.channels.fetch(CHANNEL_ID);
                if (!channel) return;

                // Embedli gönderim
                const embed = new EmbedBuilder()
                    .setTitle("📢 New Tweet")
                    .setDescription(`[View Tweet](${latest.link})`)
                    .setColor(0x1DA1F2)
                    .setTimestamp(new Date(latest.isoDate));

                await channel.send({ embeds: [embed] });

                console.log(`[XFeed] New tweet posted: ${latest.link}`);
                lastPosted = latest.link;
            }
        } catch (error) {
            console.error('[XFeed] Error checking feed:', error.message);
        }
    }

    // İlk başta çalıştır
    checkFeed();
    // Her 5 dakikada bir kontrol et
    setInterval(checkFeed, 5 * 60 * 1000);
};
