const axios = require('axios');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

/**
 * Simple wrapper for Google Gemini API (Vertex AI) using the provided API key.
 * The key is expected to be a service account key or API token that allows
 * POST requests to the Gemini endpoint.
 *
 * @param {string} prompt - The user prompt or system instruction.
 * @param {object} [options] - Optional parameters such as temperature, maxTokens.
 * @returns {Promise<string>} - The generated text response.
 */
async function generateGeminiResponse(prompt, options = {}) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const generationConfig = {};
    if (options.temperature !== undefined) generationConfig.temperature = options.temperature;
    if (options.maxTokens !== undefined) generationConfig.maxOutputTokens = options.maxTokens;
    if (options.topP !== undefined) generationConfig.topP = options.topP;
    if (options.topK !== undefined) generationConfig.topK = options.topK;

    const payload = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig
    };

    try {
        const response = await axios.post(endpoint, payload);
        const candidates = response.data?.candidates;
        if (candidates && candidates.length > 0) {
            const text = candidates[0].content?.parts?.[0]?.text;
            return text || '';
        }
        return '';
    } catch (err) {
        console.error('Gemini API error:', err.response?.data || err.message);
        throw err;
    }
}

module.exports = { generateGeminiResponse };
