const fs = require('fs').promises;
const pdf = require('pdf-parse');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const chunker = require('../utils/chunker');
const { generateEmbeddings, validateApiKey } = require('../utils/embeddings');

class DocumentProcessor {
    async processDocument(documentId, setId, filepath, mimetype) {
        try {
            console.log(`Processing document: ${documentId}`);

            validateApiKey();

            let text = '';
            if (mimetype === 'application/pdf') {
                text = await this.extractPDFText(filepath);
            } else if (mimetype === 'text/plain') {
                text = await this.extractTextFile(filepath);
            } else {
                throw new Error(`Unsupported file type: ${mimetype}. Only PDF and TXT are supported.`);
            }

            const chunks = chunker.chunkText(text);
            console.log(`Created ${chunks.length} chunks`);

            const chunkTexts = chunks.map(c => c.text);
            const embeddings = await generateEmbeddings(chunkTexts);
            console.log(`Generated ${embeddings.length} embeddings`);

            await this.storeChunks(documentId, setId, chunks, embeddings);

            console.log(`Processed ${chunks.length} chunks for document ${documentId}`);
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
            return await fs.readFile(filepath, 'utf-8');
        } catch (error) {
            console.error('Error reading text file:', error);
            throw error;
        }
    }

    async storeChunks(documentId, setId, chunks, embeddings) {
        return new Promise((resolve, reject) => {
            const stmt = db.prepare(`
                INSERT INTO chunks (id, document_id, set_id, content, chunk_index, embedding)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            chunks.forEach((chunk, index) => {
                const chunkId = uuidv4();
                stmt.run(
                    chunkId,
                    documentId,
                    setId,
                    chunk.text,
                    index,
                    JSON.stringify(embeddings[index])
                );
            });

            stmt.finalize((err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    }

    async deleteDocument(documentId) {
        try {
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
