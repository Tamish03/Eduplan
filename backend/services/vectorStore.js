// ChromaDB Vector Store Integration
// Handles vector storage and semantic similarity search

const { ChromaClient } = require('chromadb');
const { generateEmbedding, cosineSimilarity } = require('../utils/embeddings');
require('dotenv').config();

const CHROMA_PATH = process.env.CHROMA_PATH || 'http://localhost:8000';
const COLLECTION_NAME = process.env.CHROMA_COLLECTION || 'document_embeddings';

// Initialize ChromaDB client (optional - will gracefully fail if not available)
let client = null;
try {
    client = new ChromaClient({ path: CHROMA_PATH });
} catch (error) {
    console.warn('ChromaDB client initialization skipped:', error.message);
}

let collection = null;

/**
 * Initialize ChromaDB collection
 * @returns {Promise<void>}
 */
async function initializeCollection() {
    try {
        // Try to get existing collection
        collection = await client.getOrCreateCollection({
            name: COLLECTION_NAME,
            metadata: { description: 'Document chunk embeddings for RAG system' }
        });

        console.log(`ChromaDB collection "${COLLECTION_NAME}" initialized`);
    } catch (error) {
        console.error('Error initializing ChromaDB collection:', error);
        throw error;
    }
}

/**
 * Add document chunks with embeddings to ChromaDB
 * @param {Array} chunks - Array of chunk objects with id, text, metadata, and embedding
 * @returns {Promise<void>}
 */
async function addChunks(chunks) {
    if (!collection) {
        await initializeCollection();
    }

    try {
        const ids = chunks.map(chunk => chunk.id.toString());
        const embeddings = chunks.map(chunk => chunk.embedding);
        const documents = chunks.map(chunk => chunk.text);
        const metadatas = chunks.map(chunk => ({
            document_id: chunk.document_id,
            set_id: chunk.set_id,
            chunk_index: chunk.chunk_index,
            ...chunk.metadata
        }));

        await collection.add({
            ids,
            embeddings,
            documents,
            metadatas
        });

        console.log(`Added ${chunks.length} chunks to ChromaDB`);
    } catch (error) {
        console.error('Error adding chunks to ChromaDB:', error);
        throw error;
    }
}

/**
 * Search for similar chunks using semantic similarity
 * @param {string} query - Search query
 * @param {number} topK - Number of results to return
 * @param {Object} filter - Optional metadata filter
 * @returns {Promise<Array>} - Array of similar chunks with scores
 */
async function searchSimilar(query, topK = 10, filter = null) {
    if (!collection) {
        await initializeCollection();
    }

    try {
        // Generate embedding for query
        const queryEmbedding = await generateEmbedding(query);

        // Search in ChromaDB
        const results = await collection.query({
            queryEmbeddings: [queryEmbedding],
            nResults: topK,
            where: filter
        });

        // Format results
        const formattedResults = [];
        if (results.ids && results.ids[0]) {
            for (let i = 0; i < results.ids[0].length; i++) {
                formattedResults.push({
                    id: results.ids[0][i],
                    document: results.documents[0][i],
                    metadata: results.metadatas[0][i],
                    distance: results.distances[0][i],
                    similarity: 1 - results.distances[0][i] // Convert distance to similarity
                });
            }
        }

        return formattedResults;
    } catch (error) {
        console.error('Error searching ChromaDB:', error);
        throw error;
    }
}

/**
 * Search with metadata filtering
 * @param {string} query - Search query
 * @param {string} setId - Filter by set ID
 * @param {number} topK - Number of results
 * @returns {Promise<Array>} - Filtered search results
 */
async function searchBySet(query, setId, topK = 10) {
    const filter = { set_id: setId };
    return searchSimilar(query, topK, filter);
}

/**
 * Get all chunks for a specific document
 * @param {string} documentId - Document ID
 * @returns {Promise<Array>} - All chunks from the document
 */
async function getDocumentChunks(documentId) {
    if (!collection) {
        await initializeCollection();
    }

    try {
        const results = await collection.get({
            where: { document_id: documentId }
        });

        return results.documents.map((doc, i) => ({
            id: results.ids[i],
            document: doc,
            metadata: results.metadatas[i]
        }));
    } catch (error) {
        console.error('Error getting document chunks:', error);
        throw error;
    }
}

/**
 * Delete chunks by document ID
 * @param {string} documentId - Document ID
 * @returns {Promise<void>}
 */
async function deleteDocumentChunks(documentId) {
    if (!collection) {
        await initializeCollection();
    }

    try {
        await collection.delete({
            where: { document_id: documentId }
        });

        console.log(`Deleted chunks for document ${documentId}`);
    } catch (error) {
        console.error('Error deleting chunks:', error);
        throw error;
    }
}

/**
 * Get collection statistics
 * @returns {Promise<Object>} - Collection stats
 */
async function getStats() {
    if (!collection) {
        await initializeCollection();
    }

    try {
        const count = await collection.count();
        return {
            totalChunks: count,
            collectionName: COLLECTION_NAME
        };
    } catch (error) {
        console.error('Error getting stats:', error);
        throw error;
    }
}

/**
 * Hybrid search combining semantic and keyword search
 * @param {string} query - Search query
 * @param {number} topK - Number of results
 * @param {Object} filter - Optional metadata filter
 * @returns {Promise<Array>} - Hybrid search results
 */
async function hybridSearch(query, topK = 10, filter = null) {
    // Get semantic search results
    const semanticResults = await searchSimilar(query, topK * 2, filter);

    // Simple keyword matching for hybrid approach
    const keywords = query.toLowerCase().split(' ').filter(w => w.length > 3);

    // Re-rank based on both semantic similarity and keyword matches
    const rankedResults = semanticResults.map(result => {
        const doc = result.document.toLowerCase();
        const keywordScore = keywords.reduce((score, keyword) => {
            return score + (doc.includes(keyword) ? 1 : 0);
        }, 0) / keywords.length;

        // Combine semantic similarity (70%) and keyword matching (30%)
        const hybridScore = (result.similarity * 0.7) + (keywordScore * 0.3);

        return {
            ...result,
            hybridScore,
            keywordScore
        };
    });

    // Sort by hybrid score and return top K
    return rankedResults
        .sort((a, b) => b.hybridScore - a.hybridScore)
        .slice(0, topK);
}

module.exports = {
    initializeCollection,
    addChunks,
    searchSimilar,
    searchBySet,
    getDocumentChunks,
    deleteDocumentChunks,
    getStats,
    hybridSearch
};
