const { translate } = require('@vitalets/google-translate-api');

// Bayrak emojilerini dil kodlarıyla eşleştirir
const flagToLanguage = {
    '🇹🇷': 'tr',
    '🇺🇸': 'en',
    '🇬🇧': 'en',
    '🇩🇪': 'de',
    '🇫🇷': 'fr',
    '🇪🇸': 'es',
    '🇮🇹': 'it',
    '🇷🇺': 'ru',
    '🇯🇵': 'ja',
    '🇰🇷': 'ko',
    '🇨🇳': 'zh-CN',
    '🇦🇿': 'az',
    '🇸🇦': 'ar',
    '🇮🇷': 'fa'
};

/**
 * Metni hedef dile çevirir.
 * @param {string} text Çevrilecek metin
 * @param {string} emoji Reaksiyon emojisi
 * @returns {Promise<string|null>} Çevrilmiş metin veya hata durumunda null
 */
async function translateMessage(text, emoji) {
    const targetLang = flagToLanguage[emoji];
    if (!targetLang) return null;

    try {
        const res = await translate(text, { to: targetLang });
        return res.text;
    } catch (error) {
        console.error('[TRANSLATOR] Çeviri hatası:', error);
        return null;
    }
}

module.exports = { translateMessage, flagToLanguage };
