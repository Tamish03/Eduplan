// Upgraded RAG Engine with Semantic Search and Gemini integration
// Uses ChromaDB for vector search and Gemini for LLM calls

const db = require('../config/database');
const vectorStore = require('./vectorStore');
const { generateGeminiResponse } = require('../utils/geminiClient');
const { QA_SYSTEM_PROMPT, generateQAPrompt, generateHeadlinePrompt, HEADLINE_SYSTEM_PROMPT } = require('../utils/promptTemplates');
// const { validateApiKey } = require('../utils/embeddings'); // Validation not needed for Gemini

class RAGEngine {
    constructor() {
        // Initialize vector store
        vectorStore.initializeCollection().catch(err => {
            console.error('Failed to initialize vector store:', err);
        });
    }

    /**
     * Retrieve relevant chunks using semantic search
     * @param {string} query - User's query
     * @param {string} setId - Optional set ID filter
     * @param {number} limit - Number of results
     * @returns {Promise<Object>} - Search results with context
     */
    async retrieveRelevantChunks(query, setId = null, limit = 5) {
        try {
            // validateApiKey(); // Not needed for Gemini
            const filter = setId ? { set_id: setId } : null;
            const searchResults = await vectorStore.hybridSearch(query, limit, filter);
            const enrichedResults = await Promise.all(
                searchResults.map(async result => {
                    return new Promise((resolve, reject) => {
                        db.get(
                            `SELECT c.*, d.filename, s.name as set_name
                             FROM chunks c
                             JOIN documents d ON c.document_id = d.id
                             JOIN sets s ON c.set_id = s.id
                             WHERE c.id = ?`,
                            [result.id],
                            (err, row) => {
                                if (err) reject(err);
                                else {
                                    resolve({
                                        content: result.document,
                                        source: row ? row.filename : 'Unknown',
                                        set_name: row ? row.set_name : 'Unknown',
                                        chunk_id: result.id,
                                        relevance_score: result.hybridScore,
                                        semantic_score: result.similarity,
                                        keyword_score: result.keywordScore,
                                        citation: row ? `${row.filename} (Chunk ${row.chunk_index})` : 'Unknown'
                                    });
                                }
                            }
                        );
                    });
                })
            );
            return { query, results: enrichedResults, total_found: enrichedResults.length, search_type: 'semantic_hybrid' };
        } catch (error) {
            console.error('Error retrieving chunks:', error);
            console.log('Falling back to keyword search...');
            return this.keywordSearchFallback(query, setId, limit);
        }
    }

    /**
     * Fallback keyword search if vector search fails
     */
    async keywordSearchFallback(query, setId, limit) {
        return new Promise((resolve, reject) => {
            // Extract significant keywords (length > 3)
            const keywords = query.split(/\s+/).filter(w => w.length > 3).map(w => `%${w}%`);

            if (keywords.length === 0) {
                // If no significant keywords, try the original query
                keywords.push(`%${query}%`);
            }

            let sql = `
                SELECT c.*, d.filename, s.name as set_name
                FROM chunks c
                JOIN documents d ON c.document_id = d.id
                JOIN sets s ON c.set_id = s.id
                WHERE (`;

            // Create OR conditions for each keyword
            const conditions = keywords.map(() => 'c.content LIKE ?');
            sql += conditions.join(' OR ') + ')';

            const params = [...keywords];

            if (setId) {
                sql += ' AND c.set_id = ?';
                params.push(setId);
            }

            sql += ' LIMIT ?';
            params.push(limit);

            db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                const formattedResults = rows.map(result => ({
                    content: result.content,
                    source: result.filename,
                    set_name: result.set_name,
                    chunk_id: result.id,
                    relevance_score: 0.5,
                    citation: `${result.filename} (Chunk ${result.chunk_index})`
                }));
                resolve({ query, results: formattedResults, total_found: rows.length, search_type: 'keyword_fallback_enhanced' });
            });
        });
    }

    /**
     * Generate answer using Gemini LLM
     * @param {string} query - User's question
     * @param {string} setId - Optional set ID filter
     * @returns {Promise<Object>} - Answer with sources
     */
    async generateAnswer(query, setId = null) {
        try {
            // validateApiKey(); // Not needed for Gemini
            const retrieval = await this.retrieveRelevantChunks(query, setId, 5);
            if (retrieval.results.length === 0) {
                return { answer: "I couldn't find any relevant information in your documents to answer this question. Try uploading more materials or rephrasing your query.", sources: [], confidence: 0 };
            }
            const userPrompt = generateQAPrompt(query, retrieval.results);
            const fullPrompt = `${QA_SYSTEM_PROMPT}\n\n${userPrompt}`;
            const answer = await generateGeminiResponse(fullPrompt, { temperature: 0.7, maxTokens: 1000 });
            return {
                answer,
                sources: retrieval.results.map(r => ({ citation: r.citation, source: r.source, relevance: r.relevance_score })),
                confidence: this.calculateConfidence(retrieval.results),
                search_type: retrieval.search_type
            };
        } catch (error) {
            console.error('Error generating answer:', error);
            throw error;
        }
    }

    /**
     * Calculate confidence score based on retrieval results
     */
    calculateConfidence(results) {
        if (results.length === 0) return 0;
        const avgScore = results.reduce((sum, r) => sum + r.relevance_score, 0) / results.length;
        return Math.min(avgScore, 1);
    }

    /**
     * Generate headlines using Gemini
     * @param {string} setId - Set ID
     * @param {number} limit - Number of headlines
     * @returns {Promise<Array>} - Generated headlines
     */
    async generateHeadlines(setId, limit = 5) {
        try {
            const chunks = await new Promise((resolve, reject) => {
                db.all(
                    `SELECT c.content, d.filename, s.name as set_name, s.subject
                     FROM chunks c
                     JOIN documents d ON c.document_id = d.id
                     JOIN sets s ON c.set_id = s.id
                     WHERE c.set_id = ?
                     ORDER BY c.chunk_index
                     LIMIT 10`,
                    [setId],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    }
                );
            });
            if (chunks.length === 0) return [];
            const prompt = generateHeadlinePrompt(chunks.map(c => c.content).join('\n'));
            const fullPrompt = `${HEADLINE_SYSTEM_PROMPT}\n\n${prompt}`;
            const headlineText = await generateGeminiResponse(fullPrompt, { temperature: 0.5, maxTokens: 500 });
            const titles = headlineText.split('\n').filter(t => t.trim()).slice(0, limit);
            return titles.map((title, i) => ({
                title: title.trim(),
                source: chunks[i] ? chunks[i].filename : 'Unknown',
                set_name: chunks[i] ? chunks[i].set_name : 'Unknown',
                subject: chunks[i] ? chunks[i].subject : 'Unknown'
            }));
        } catch (error) {
            console.error('Error generating headlines:', error);
            return [];
        }
    }

    /**
     * Analyze knowledge gaps using Gemini
     * @param {string} setId - Set ID
     * @returns {Promise<Object>} - Gap analysis
     */
    async analyzeKnowledgeGaps(setId) {
        try {
            const chunks = await new Promise((resolve, reject) => {
                db.all(
                    `SELECT c.content, s.subject, s.grade, s.name
                     FROM chunks c
                     JOIN sets s ON c.set_id = s.id
                     WHERE c.set_id = ?`,
                    [setId],
                    (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    }
                );
            });
            if (chunks.length === 0) {
                return { total_chunks: 0, coverage: 'none', missing_topics: [], recommendations: [] };
            }
            const combined = chunks.slice(0, 20).map(c => c.content).join('\n\n');
            const systemPrompt = "You are an educational content analyzer. Analyze the provided study materials and identify knowledge gaps, missing topics, and areas that need more coverage.";
            const userPrompt = `Analyze this educational content for set ${setId} (subject: ${chunks[0].subject}, grade: ${chunks[0].grade}):\n\n${combined}`;
            const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;
            const analysis = await generateGeminiResponse(fullPrompt, { temperature: 0.7, maxTokens: 800 });
            const coverage = chunks.length > 20 ? 'good' : chunks.length > 10 ? 'moderate' : 'limited';
            return { total_chunks: chunks.length, coverage, analysis, recommendations: this.generateRecommendations(chunks) };
        } catch (error) {
            console.error('Error analyzing knowledge gaps:', error);
            return { total_chunks: 0, coverage: 'none', missing_topics: [], recommendations: [] };
        }
    }

    /**
     * Generate recommendations based on content
     */
    generateRecommendations(chunks) {
        const recommendations = [];
        if (chunks.length < 5) recommendations.push('Add more study materials to improve coverage');
        if (chunks.length > 50) recommendations.push('Consider breaking this into smaller, focused Sets');
        recommendations.push('Review weak areas identified in Progress tracking');
        recommendations.push('Practice with problem sets to reinforce concepts');
        recommendations.push('Use the Content Finder to discover additional resources');
        return recommendations;
    }
}

module.exports = new RAGEngine();
