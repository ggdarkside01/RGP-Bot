const { Client, GatewayIntentBits, Collection } = require('discord.js');
require('dotenv').config();
const keepAlive = require('./keep_alive');
keepAlive();
const fs = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

client.commands = new Collection();
client.activeGiveaways = new Map();
client.queues = new Map();
client.config = require('./config.json');

// Load Handlers
const handlersPath = path.join(__dirname, 'handlers');
fs.readdirSync(handlersPath).forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

// Tempban Check Loop
setInterval(async () => {
    const bansPath = path.join(__dirname, 'temp-bans.json');
    if (!fs.existsSync(bansPath)) return;

    let bans = [];
    try { bans = JSON.parse(fs.readFileSync(bansPath, 'utf8')); } catch (e) { return; }

    const now = Date.now();
    const expiredBans = bans.filter(ban => ban.unbanDate <= now);
    const activeBans = bans.filter(ban => ban.unbanDate > now);

    if (expiredBans.length > 0) {
        for (const ban of expiredBans) {
            try {
                const guild = client.guilds.cache.get(ban.guildId);
                if (guild) {
                    await guild.members.unban(ban.userId, 'Geçici yasak süresi doldu.');
                    console.log(`[TEMPBAN] ${ban.userId} yasak kaldırıldı. (Süre doldu)`);
                }
            } catch (err) {
                console.error(`[TEMPBAN] ${ban.userId} yasağı kaldırılamadı:`, err);
            }
        }

        // Update file
        fs.writeFileSync(bansPath, JSON.stringify(activeBans, null, 4));
    }
}, 60000); // Check every 60 seconds

client.login(process.env.DISCORD_TOKEN).catch(err => {
    console.error('Bot giriş yaparken hata oluştu:', err);
});

// Gelişmiş Anti-Crash Sistemi
process.on('unhandledRejection', (reason, promise) => {
    console.error(' [ANTI-CRASH] Gelişmiş Hata Yakalayıcı (Unhandled Rejection):');
    console.error('Sebep:', reason);
    console.error('Promise:', promise);
});

process.on('uncaughtException', (err, origin) => {
    console.error(' [ANTI-CRASH] Gelişmiş Hata Yakalayıcı (Uncaught Exception):');
    console.error('Hata:', err);
    console.error('Kaynak:', origin);
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.error(' [ANTI-CRASH] İzleyici (Monitor): Bir hata oluştu ancak bot hala ayakta.');
    console.error(err);
});

