const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getGeminiApiKey } = require('../utils/env');

// Initialize Google Gemini
// Make sure you have GEMINI_API_KEY in your .env and Render Environment Variables
const geminiApiKey = getGeminiApiKey();
if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY (or GOOGLE_API_KEY) is required for vectorStore');
}
const genAI = new GoogleGenerativeAI(geminiApiKey);
const model = genAI.getGenerativeModel({ model: "embedding-001" });

// Connect to SQLite
const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

// 1. Initialize Table
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS document_vectors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT,
            metadata TEXT,
            embedding TEXT
        )
    `);
});

// Helper: Cosine Similarity
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// 2. Add Documents (Using Gemini Embeddings)
async function addDocuments(texts, metadatas) {
    console.log(`Generating Gemini embeddings for ${texts.length} documents...`);
    
    // Generate Embeddings loop
    const embeddings = [];
    for (const text of texts) {
        // Gemini generates embeddings one by one (or in small batches)
        const result = await model.embedContent(text);
        const vector = result.embedding.values;
        embeddings.push(vector);
    }

    // Insert into SQLite
    const stmt = db.prepare("INSERT INTO document_vectors (content, metadata, embedding) VALUES (?, ?, ?)");
    
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        texts.forEach((text, i) => {
            stmt.run(text, JSON.stringify(metadatas[i]), JSON.stringify(embeddings[i]));
        });
        db.run("COMMIT");
    });
    
    stmt.finalize();
    console.log("Documents saved to SQLite.");
}

// 3. Search (Using Gemini Embeddings)
async function similaritySearch(query, k = 4) {
    console.log(`Searching for: "${query}"`);

    // 1. Get embedding for the QUESTION
    const result = await model.embedContent(query);
    const queryEmbedding = result.embedding.values;

    // 2. Fetch and Compare
    return new Promise((resolve, reject) => {
        db.all("SELECT content, metadata, embedding FROM document_vectors", [], (err, rows) => {
            if (err) return reject(err);

            if (!rows || rows.length === 0) {
                return resolve([]);
            }

            const scoredRows = rows.map(row => {
                const docEmbedding = JSON.parse(row.embedding);
                const score = cosineSimilarity(queryEmbedding, docEmbedding);
                return {
                    pageContent: row.content,
                    metadata: JSON.parse(row.metadata),
                    score: score
                };
            });

            scoredRows.sort((a, b) => b.score - a.score);
            const topResults = scoredRows.slice(0, k);

            resolve(topResults);
        });
    });
}

module.exports = { addDocuments, similaritySearch };
