// LLM Client for GPT-4 Integration
// Centralized client for all LLM interactions

const OpenAI = require('openai');
require('dotenv').config();

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const LLM_MODEL = process.env.LLM_MODEL || 'gpt-4-turbo-preview';
const MAX_TOKENS = parseInt(process.env.MAX_TOKENS) || 4096;
const TEMPERATURE = parseFloat(process.env.TEMPERATURE) || 0.7;

/**
 * Generate completion using GPT-4
 * @param {string} systemPrompt - System instructions
 * @param {string} userPrompt - User query
 * @param {Object} options - Additional options
 * @returns {Promise<string>} - Generated response
 */
async function generateCompletion(systemPrompt, userPrompt, options = {}) {
    try {
        const response = await openai.chat.completions.create({
            model: options.model || LLM_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: options.maxTokens || MAX_TOKENS,
            temperature: options.temperature !== undefined ? options.temperature : TEMPERATURE,
            top_p: options.topP || 1,
            frequency_penalty: options.frequencyPenalty || 0,
            presence_penalty: options.presencePenalty || 0
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error generating completion:', error.message);
        throw error;
    }
}

/**
 * Generate completion with conversation history
 * @param {Array} messages - Array of message objects
 * @param {Object} options - Additional options
 * @returns {Promise<string>} - Generated response
 */
async function generateChatCompletion(messages, options = {}) {
    try {
        const response = await openai.chat.completions.create({
            model: options.model || LLM_MODEL,
            messages,
            max_tokens: options.maxTokens || MAX_TOKENS,
            temperature: options.temperature !== undefined ? options.temperature : TEMPERATURE
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error generating chat completion:', error.message);
        throw error;
    }
}

/**
 * Generate streaming completion
 * @param {string} systemPrompt - System instructions
 * @param {string} userPrompt - User query
 * @param {Function} onChunk - Callback for each chunk
 * @param {Object} options - Additional options
 * @returns {Promise<string>} - Complete response
 */
async function generateStreamingCompletion(systemPrompt, userPrompt, onChunk, options = {}) {
    try {
        const stream = await openai.chat.completions.create({
            model: options.model || LLM_MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: options.maxTokens || MAX_TOKENS,
            temperature: options.temperature !== undefined ? options.temperature : TEMPERATURE,
            stream: true
        });

        let fullResponse = '';
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullResponse += content;
            if (onChunk && content) {
                onChunk(content);
            }
        }

        return fullResponse;
    } catch (error) {
        console.error('Error generating streaming completion:', error.message);
        throw error;
    }
}

/**
 * Count tokens in text (approximate)
 * @param {string} text - Text to count
 * @returns {number} - Approximate token count
 */
function estimateTokens(text) {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
}

/**
 * Truncate text to fit within token limit
 * @param {string} text - Text to truncate
 * @param {number} maxTokens - Maximum tokens
 * @returns {string} - Truncated text
 */
function truncateToTokenLimit(text, maxTokens) {
    const estimatedTokens = estimateTokens(text);
    if (estimatedTokens <= maxTokens) {
        return text;
    }

    const ratio = maxTokens / estimatedTokens;
    const targetLength = Math.floor(text.length * ratio * 0.95); // 5% safety margin
    return text.substring(0, targetLength) + '...';
}

/**
 * Validate API key is configured
 * @throws {Error} - If API key is missing
 */
function validateApiKey() {
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes('your')) {
        throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in .env file');
    }
}

/**
 * Get model information
 * @returns {Object} - Model configuration
 */
function getModelInfo() {
    return {
        model: LLM_MODEL,
        maxTokens: MAX_TOKENS,
        temperature: TEMPERATURE
    };
}

module.exports = {
    generateCompletion,
    generateChatCompletion,
    generateStreamingCompletion,
    estimateTokens,
    truncateToTokenLimit,
    validateApiKey,
    getModelInfo,
    LLM_MODEL
};
