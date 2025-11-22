// Gemini Embeddings Integration
// Replaces OpenAI with Google Gemini text-embedding-004

const axios = require('axios');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const EMBEDDING_MODEL = 'models/text-embedding-004';
const BATCH_SIZE = 100;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

/**
 * Generate embeddings for a single text using Gemini
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector (768 dimensions)
 */
async function generateEmbedding(text) {
    if (!text || text.trim().length === 0) {
        throw new Error('Text cannot be empty');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/${EMBEDDING_MODEL}:embedContent?key=${apiKey}`;

    try {
        const response = await axios.post(endpoint, {
            content: { parts: [{ text }] }
        });

        return response.data.embedding.values;
    } catch (error) {
        console.error('Error generating embedding:', error.response?.data || error.message);
        throw error;
    }
}

/**
 * Generate embeddings for multiple texts in batches
 * @param {string[]} texts - Array of texts to embed
 * @returns {Promise<number[][]>} - Array of embedding vectors
 */
async function generateEmbeddings(texts) {
    if (!Array.isArray(texts) || texts.length === 0) {
        throw new Error('Texts must be a non-empty array');
    }

    // Gemini batch embedding endpoint is different or we can just loop single calls for now
    // or use batchEmbedContents if available.
    // batchEmbedContents is available: models/text-embedding-004:batchEmbedContents

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/${EMBEDDING_MODEL}:batchEmbedContents?key=${apiKey}`;

    const embeddings = [];

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
        const batch = texts.slice(i, i + BATCH_SIZE);

        try {
            const requests = batch.map(text => ({
                content: { parts: [{ text }] },
                model: EMBEDDING_MODEL
            }));

            const response = await axios.post(endpoint, { requests });

            // response.data.embeddings is an array of objects { values: [...] }
            const batchEmbeddings = response.data.embeddings.map(e => e.values);
            embeddings.push(...batchEmbeddings);

            console.log(`Generated embeddings for ${embeddings.length}/${texts.length} texts`);
        } catch (error) {
            console.error(`Error in batch ${i / BATCH_SIZE + 1}:`, error.response?.data || error.message);
            throw error;
        }
    }

    return embeddings;
}

/**
 * Generate embedding with retry logic
 */
async function generateEmbeddingWithRetry(text, retries = MAX_RETRIES) {
    try {
        return await generateEmbedding(text);
    } catch (error) {
        if (retries > 0) {
            console.log(`Retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            return generateEmbeddingWithRetry(text, retries - 1);
        }
        throw error;
    }
}

/**
 * Calculate cosine similarity
 */
function cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
        // Handle dimension mismatch if switching models
        console.warn(`Vector dimension mismatch: ${vecA.length} vs ${vecB.length}`);
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

    return (normA === 0 || normB === 0) ? 0 : dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function getEmbeddingDimensions() {
    return 768; // text-embedding-004 is 768 dimensions
}

function validateApiKey() {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY not configured');
    }
}

module.exports = {
    generateEmbedding,
    generateEmbeddings,
    generateEmbeddingWithRetry,
    cosineSimilarity,
    getEmbeddingDimensions,
    validateApiKey,
    EMBEDDING_MODEL
};
