const axios = require('axios');
const path = require('path');
const { getGeminiApiKey } = require('./env');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

function parseModelList(raw, defaults) {
    const source = raw || defaults;
    return source
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean)
        .map((m) => (m.startsWith('models/') ? m : `models/${m}`));
}

const CONFIGURED_GENERATION_MODELS = parseModelList(
    process.env.GEMINI_GENERATION_MODELS,
    'gemini-2.0-flash,gemini-1.5-flash,gemini-1.5-flash-8b'
);

let discoveredGenerationModels = null;

async function discoverGenerationModels(apiKey) {
    if (discoveredGenerationModels) return discoveredGenerationModels;

    try {
        const res = await axios.get('https://generativelanguage.googleapis.com/v1beta/models', {
            headers: { 'x-goog-api-key': apiKey }
        });

        const models = (res.data?.models || [])
            .filter((m) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
            .map((m) => m.name)
            .filter(Boolean);

        discoveredGenerationModels = models;
        return models;
    } catch {
        return [];
    }
}

async function getCandidateModels(apiKey) {
    const discovered = await discoverGenerationModels(apiKey);
    if (!discovered.length) return CONFIGURED_GENERATION_MODELS;

    const prioritized = CONFIGURED_GENERATION_MODELS.filter((m) => discovered.includes(m));
    const extras = discovered.filter((m) => !prioritized.includes(m));
    return [...prioritized, ...extras];
}

function shouldTryNextModel(err) {
    const status = err?.response?.status;
    const message = String(err?.response?.data?.error?.message || err?.message || '').toLowerCase();

    if ([404, 429, 503].includes(status)) return true;
    if (status === 400 && (message.includes('not found') || message.includes('not supported'))) return true;
    return false;
}

async function generateGeminiResponse(prompt, options = {}) {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY (or GOOGLE_API_KEY) is not set in environment variables');
    }

    const generationConfig = {};
    if (options.temperature !== undefined) generationConfig.temperature = options.temperature;
    if (options.maxTokens !== undefined) generationConfig.maxOutputTokens = options.maxTokens;
    if (options.topP !== undefined) generationConfig.topP = options.topP;
    if (options.topK !== undefined) generationConfig.topK = options.topK;

    const payload = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig
    };

    const failures = [];
    const candidateModels = await getCandidateModels(apiKey);

    for (const model of candidateModels) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent`;
        try {
            const response = await axios.post(endpoint, payload, {
                headers: { 'x-goog-api-key': apiKey }
            });

            const candidates = response.data?.candidates;
            if (candidates && candidates.length > 0) {
                const text = candidates[0].content?.parts?.[0]?.text;
                return text || '';
            }
            return '';
        } catch (err) {
            failures.push({
                model,
                status: err?.response?.status,
                message: err?.response?.data?.error?.message || err.message
            });

            if (!shouldTryNextModel(err)) {
                break;
            }
        }
    }

    const error = new Error('All Gemini generation model attempts failed');
    error.failures = failures;
    console.error('Gemini generation failed across models:', failures);
    throw error;
}

module.exports = { generateGeminiResponse, CONFIGURED_GENERATION_MODELS };
