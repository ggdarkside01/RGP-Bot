const { REST, Routes } = require('discord.js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFilePaths = [];

function getCommandFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getCommandFiles(filePath);
        } else if (file.endsWith('.js')) {
            commandFilePaths.push(filePath);
        }
    }
}

getCommandFiles(commandsPath);

for (const filePath of commandFilePaths) {
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        try {
            const cmdData = command.data.toJSON();
            commands.push(cmdData);
            console.log(`[INFO] Komut yüklendi: ${cmdData.name}`);
        } catch (error) {
            console.error(`[ERROR] ${filePath} komutu yüklenirken hata oluştu:`, error);
        }
    } else {
        console.log(`[WARNING] ${filePath} dosyasında "data" veya "execute" özelliği eksik.`);
    }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log(`${commands.length} adet (/) komutu yükleniyor...`);

        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands },
        );

        console.log(`Başarıyla ${data.length} adet (/) komutu Discord'a tanıtıldı!`);
    } catch (error) {
        console.error(error);
        fs.writeFileSync('deploy_error.log', JSON.stringify(error, null, 2));
    }
})();
