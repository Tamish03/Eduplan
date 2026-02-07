const axios = require('axios');
const path = require('path');
const { getGeminiApiKey } = require('./env');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

function parseModelList(raw, defaults) {
    const source = raw || defaults;
    return source
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean)
        .map((m) => (m.startsWith('models/') ? m : `models/${m}`));
}

const CONFIGURED_EMBEDDING_MODELS = parseModelList(
    process.env.GEMINI_EMBEDDING_MODELS,
    'gemini-embedding-001,text-embedding-004,embedding-001'
);

let discoveredEmbeddingModels = null;

async function discoverEmbeddingModels(apiKey) {
    if (discoveredEmbeddingModels) return discoveredEmbeddingModels;

    try {
        const res = await axios.get('https://generativelanguage.googleapis.com/v1beta/models', {
            headers: { 'x-goog-api-key': apiKey }
        });

        const models = (res.data?.models || [])
            .filter((m) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('embedContent'))
            .map((m) => m.name)
            .filter(Boolean);

        discoveredEmbeddingModels = models;
        return models;
    } catch {
        return [];
    }
}

async function getCandidateEmbeddingModels(apiKey) {
    const discovered = await discoverEmbeddingModels(apiKey);
    if (!discovered.length) return CONFIGURED_EMBEDDING_MODELS;

    const prioritized = CONFIGURED_EMBEDDING_MODELS.filter((m) => discovered.includes(m));
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

async function generateEmbedding(text) {
    if (!text || text.trim().length === 0) {
        throw new Error('Text cannot be empty');
    }

    const apiKey = getGeminiApiKey();
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');

    const failures = [];
    const models = await getCandidateEmbeddingModels(apiKey);

    for (const model of models) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/${model}:embedContent`;
        try {
            const response = await axios.post(
                endpoint,
                { content: { parts: [{ text }] } },
                { headers: { 'x-goog-api-key': apiKey } }
            );

            return response.data.embedding.values;
        } catch (error) {
            failures.push({
                model,
                status: error?.response?.status,
                message: error?.response?.data?.error?.message || error.message
            });

            if (!shouldTryNextModel(error)) {
                break;
            }
        }
    }

    const e = new Error('All embedding model attempts failed');
    e.failures = failures;
    console.error('Embedding model failures:', failures);
    throw e;
}

async function generateEmbeddings(texts) {
    if (!Array.isArray(texts) || texts.length === 0) {
        throw new Error('Texts must be a non-empty array');
    }

    const apiKey = getGeminiApiKey();
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');

    const models = await getCandidateEmbeddingModels(apiKey);

    for (const model of models) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/${model}:batchEmbedContents`;
        try {
            const requests = texts.map((text) => ({
                content: { parts: [{ text }] },
                model
            }));

            const response = await axios.post(
                endpoint,
                { requests },
                { headers: { 'x-goog-api-key': apiKey } }
            );

            const batchEmbeddings = response.data.embeddings.map((e) => e.values);
            return batchEmbeddings;
        } catch (error) {
            if (!shouldTryNextModel(error)) {
                break;
            }
        }
    }

    const embeddings = [];
    for (const text of texts) {
        embeddings.push(await generateEmbedding(text));
    }
    return embeddings;
}

async function generateEmbeddingWithRetry(text, retries = MAX_RETRIES) {
    try {
        return await generateEmbedding(text);
    } catch (error) {
        if (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
            return generateEmbeddingWithRetry(text, retries - 1);
        }
        throw error;
    }
}

function cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
        return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    return normA === 0 || normB === 0 ? 0 : dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function getEmbeddingDimensions() {
    return 768;
}

function validateApiKey() {
    if (!getGeminiApiKey()) {
        throw new Error('GEMINI_API_KEY (or GOOGLE_API_KEY) not configured');
    }
}

module.exports = {
    generateEmbedding,
    generateEmbeddings,
    generateEmbeddingWithRetry,
    cosineSimilarity,
    getEmbeddingDimensions,
    validateApiKey,
    CONFIGURED_EMBEDDING_MODELS
};
