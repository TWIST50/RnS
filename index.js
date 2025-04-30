const { Client, GatewayIntentBits, ActivityType, REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();
const express = require('express');
const path = require('path');
const startXFeed = require('./xfeed.js'); // ✅ Tweet embed modülü

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

// Express sunucusu (Render için)
const app = express();
const port = 3000;
app.get('/', (req, res) => {
  const imagePath = path.join(__dirname, 'index.html');
  res.sendFile(imagePath);
});
app.listen(port, () => {
  console.log('[ SERVER ] SH : http://localhost:' + port + ' ✅');
});

const statusMessages = ["🎉 Join our Katana Giveaway! ⚔️"];
const statusTypes = ['dnd', 'idle'];
let currentStatusIndex = 0;
let currentTypeIndex = 0;

async function login() {
  try {
    await client.login(process.env.TOKEN);
    console.log('[ LOGIN ] Logged in as:', client.user.tag);
  } catch (error) {
    console.error('[ ERROR ] Failed to login:', error);
    process.exit(1);
  }
}

function updateStatus() {
  const currentStatus = statusMessages[currentStatusIndex];
  const currentType = statusTypes[currentTypeIndex];
  client.user.setPresence({
    activities: [{ name: currentStatus, type: ActivityType.Custom }],
    status: currentType,
  });
  console.log('[ STATUS ]', `Updated to: ${currentStatus} (${currentType})`);
  currentStatusIndex = (currentStatusIndex + 1) % statusMessages.length;
  currentTypeIndex = (currentTypeIndex + 1) % statusTypes.length;
}

function heartbeat() {
  setInterval(() => {
    console.log('[ HEARTBEAT ] Bot is alive at', new Date().toLocaleTimeString());
  }, 30000);
}

client.once('ready', async () => {
  console.log('[ INFO ] Ping:', client.ws.ping, 'ms');
  updateStatus();
  setInterval(updateStatus, 10000);
  heartbeat();
  startXFeed(client); // 🔁 Twitter otomatik paylaşım

  // 🔧 Slash komutlarını yükle
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      {
        body: [
          new SlashCommandBuilder()
            .setName('send')
            .setDescription('Belirtilen kanala mesaj gönderir.')
            .addChannelOption(option =>
              option.setName('channel')
                .setDescription('Gönderilecek kanal')
                .setRequired(true))
            .addStringOption(option =>
              option.setName('message')
                .setDescription('Gönderilecek mesaj')
                .setRequired(true))
        ]
      }
    );
    console.log('[ SLASH ] /send komutu başarıyla yüklendi.');
  } catch (error) {
    console.error('[ SLASH ERROR ]', error);
  }
});

// 🔧 /send komutu işlemesi
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === 'send') {
    const channel = interaction.options.getChannel('channel');
    const message = interaction.options.getString('message');

    try {
      await channel.send(message);
      await interaction.reply({ content: `✅ Mesaj gönderildi: ${channel}`, ephemeral: true });
    } catch (err) {
      console.error('[ SEND ERROR ]', err);
      await interaction.reply({ content: '❌ Mesaj gönderilemedi.', ephemeral: true });
    }
  }
});

client.on('guildMemberAdd', async (member) => {
  const role = member.guild.roles.cache.find(r => r.name === 'Member');
  if (role) {
    try {
      await member.roles.add(role);
      console.log(`[AUTO-ROLE] ${member.user.tag} -> Member rolü verildi.`);
    } catch (err) {
      console.error('[AUTO-ROLE ERROR]', err.message);
    }
  }
});

login();

// 🔁 Render için kendine ping atma sistemi
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
setInterval(() => {
  fetch('https://rns-7dme.onrender.com')
    .then(() => console.log('[ KEEP-ALIVE ] Ping gönderildi'))
    .catch(err => console.error('[ KEEP-ALIVE ERROR ]', err));
}, 5 * 60 * 1000);
