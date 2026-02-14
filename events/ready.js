const { Events } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`[READY] ${client.user.tag} olarak giriş yapıldı!`);
        client.user.setActivity('RGP Shop', { type: 3 }); // Watching
    },
};
