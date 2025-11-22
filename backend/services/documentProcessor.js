const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const chunker = require('../utils/chunker');
const { generateEmbeddings, validateApiKey } = require('../utils/embeddings');
const vectorStore = require('./vectorStore');

class DocumentProcessor {
    async processDocument(documentId, setId, filepath, mimetype) {
        try {
            console.log(`Processing document: ${documentId}`);

            // Validate API key before processing
            validateApiKey();

            // Extract text based on file type
            let text = '';
            if (mimetype === 'application/pdf') {
                text = await this.extractPDFText(filepath);
            } else if (mimetype === 'text/plain') {
                text = await this.extractTextFile(filepath);
            } else {
                throw new Error(`Unsupported file type: ${mimetype}`);
            }

            // Chunk the text
            const chunks = chunker.chunkText(text);
            console.log(`Created ${chunks.length} chunks`);

            // Generate embeddings for all chunks
            console.log('Generating embeddings with OpenAI...');
            const chunkTexts = chunks.map(c => c.text);
            const embeddings = await generateEmbeddings(chunkTexts);
            console.log(`Generated ${embeddings.length} embeddings`);

            // Store chunks with embeddings in both SQLite and ChromaDB
            await this.storeChunks(documentId, setId, chunks, embeddings);

            console.log(`✅ Processed ${chunks.length} chunks for document ${documentId}`);
            return { success: true, chunkCount: chunks.length };
        } catch (error) {
            console.error('Error processing document:', error);
            throw error;
        }
    }

    async extractPDFText(filepath) {
        try {
            const dataBuffer = await fs.readFile(filepath);
            const data = await pdf(dataBuffer);
            return data.text;
        } catch (error) {
            console.error('Error extracting PDF text:', error);
            throw error;
        }
    }

    async extractTextFile(filepath) {
        try {
            const text = await fs.readFile(filepath, 'utf-8');
            return text;
        } catch (error) {
            console.error('Error reading text file:', error);
            throw error;
        }
    }

    async storeChunks(documentId, setId, chunks, embeddings) {
        return new Promise(async (resolve, reject) => {
            try {
                // Get document info for metadata
                const document = await new Promise((res, rej) => {
                    db.get('SELECT * FROM documents WHERE id = ?', [documentId], (err, row) => {
                        if (err) rej(err);
                        else res(row);
                    });
                });

                // Prepare chunks for ChromaDB
                const chromaChunks = [];

                // Store in SQLite
                const stmt = db.prepare(`
          INSERT INTO chunks (id, document_id, set_id, content, chunk_index, embedding)
          VALUES (?, ?, ?, ?, ?, ?)
        `);

                chunks.forEach((chunk, index) => {
                    const chunkId = uuidv4();
                    const embedding = embeddings[index];

                    // Store in SQLite
                    stmt.run(
                        chunkId,
                        documentId,
                        setId,
                        chunk.text,
                        index,
                        JSON.stringify(embedding)
                    );

                    // Prepare for ChromaDB
                    chromaChunks.push({
                        id: chunkId,
                        text: chunk.text,
                        embedding: embedding,
                        document_id: documentId,
                        set_id: setId,
                        chunk_index: index,
                        metadata: {
                            source: document.filename,
                            document_name: document.filename,
                            upload_date: document.upload_date
                        }
                    });
                });

                stmt.finalize(async (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    try {
                        // Store in ChromaDB for vector search
                        await vectorStore.addChunks(chromaChunks);
                        console.log(`Stored ${chromaChunks.length} chunks in ChromaDB`);
                        resolve();
                    } catch (vectorError) {
                        console.error('Error storing in ChromaDB:', vectorError);
                        // Don't fail the whole operation if ChromaDB fails
                        // SQLite storage is still successful
                        resolve();
                    }
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    async deleteDocument(documentId) {
        try {
            // Delete from ChromaDB
            await vectorStore.deleteDocumentChunks(documentId);

            // Delete from SQLite
            return new Promise((resolve, reject) => {
                db.run('DELETE FROM chunks WHERE document_id = ?', [documentId], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        } catch (error) {
            console.error('Error deleting document:', error);
            throw error;
        }
    }
}

module.exports = new DocumentProcessor();
