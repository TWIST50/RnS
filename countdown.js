const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

const CHANNEL_ID = "1366100117781876756"; // BURAYA countdown embed'inin gönderileceği kanal ID
const TARGET_DATE = new Date("2025-05-09T23:00:00Z"); // Final tarih

client.once('ready', async () => {
  console.log(`[Countdown] Bot aktif: ${client.user.tag}`);

  const channel = await client.channels.fetch(CHANNEL_ID);
  if (!channel) {
    console.error("[Countdown] Kanal bulunamadı!");
    return;
  }

  const initialEmbed = new EmbedBuilder()
    .setColor(0xFFD700)
    .setDescription(`⏳ Preparing countdown...`);
  const countdownMessage = await channel.send({ embeds: [initialEmbed] });

  setInterval(async () => {
    try {
      const now = new Date();
      const diffMs = TARGET_DATE - now;

      if (diffMs <= 0) {
        await countdownMessage.edit({
          content: "@everyone\n\n# 🎉 The raffle draw is happening NOW! 🎉",
          embeds: []
        });
        console.log("[Countdown] Geri sayım bitti!");
        return;
      }

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diffMs / (1000 * 60)) % 60);

      const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setDescription(`## ⏳ Raffle Draw Countdown :\n\n  **${days}d ${hours}h ${minutes}m remaining!**`);

      await countdownMessage.edit({ embeds: [embed] });
    } catch (error) {
      console.error("[Countdown] Güncelleme hatası:", error.message);
    }
  }, 60000); // Her 60 saniyede bir güncelle
});

client.login(process.env.TOKEN);
