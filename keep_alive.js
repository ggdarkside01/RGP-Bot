const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.send('Bot 7/24 Aktif!');
});

function keepAlive() {
    app.listen(port, () => {
        console.log(`[KEEP-ALIVE] Sunucu http://localhost:${port} adresinde çalışıyor.`);
    });
}

module.exports = keepAlive;
