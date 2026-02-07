function normalizeApiKey(raw) {
    if (!raw) return '';
    return String(raw).trim().replace(/^['"]|['"]$/g, '');
}

function getGeminiApiKey() {
    return normalizeApiKey(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
}

module.exports = {
    getGeminiApiKey,
};
