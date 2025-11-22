const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const natural = require('natural');

class KnowledgeGraph {
    constructor() {
        this.tokenizer = new natural.WordTokenizer();
    }

    // Get connections for a set
    async getSetConnections(setId) {
        return new Promise((resolve, reject) => {
            const sql = `
        SELECT 
          c.*,
          s1.name as source_name,
          s1.subject as source_subject,
          s2.name as target_name,
          s2.subject as target_subject
        FROM connections c
        JOIN sets s1 ON c.source_set_id = s1.id
        JOIN sets s2 ON c.target_set_id = s2.id
        WHERE c.source_set_id = ? OR c.target_set_id = ?
        ORDER BY c.strength DESC
      `;

            db.all(sql, [setId, setId], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    }

    // Build connections between sets based on content similarity
    async buildConnections(setId) {
        try {
            // Get all sets except the current one
            const sets = await this.getAllSetsExcept(setId);

            // Get content for current set
            const currentContent = await this.getSetContent(setId);

            // Calculate similarity with each set
            for (const set of sets) {
                const targetContent = await this.getSetContent(set.id);
                const similarity = this.calculateSimilarity(currentContent, targetContent);

                if (similarity > 0.3) { // Threshold for creating connection
                    await this.createConnection(setId, set.id, similarity);
                }
            }

            return { success: true, message: 'Connections built successfully' };
        } catch (error) {
            console.error('Error building connections:', error);
            throw error;
        }
    }

    async getAllSetsExcept(excludeId) {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM sets WHERE id != ?', [excludeId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    async getSetContent(setId) {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT content FROM chunks WHERE set_id = ?',
                [setId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows.map(r => r.content).join(' '));
                }
            );
        });
    }

    calculateSimilarity(text1, text2) {
        // Tokenize both texts
        const tokens1 = new Set(this.tokenizer.tokenize(text1.toLowerCase()));
        const tokens2 = new Set(this.tokenizer.tokenize(text2.toLowerCase()));

        // Calculate Jaccard similarity
        const intersection = new Set([...tokens1].filter(x => tokens2.has(x)));
        const union = new Set([...tokens1, ...tokens2]);

        return intersection.size / union.size;
    }

    async createConnection(sourceId, targetId, strength) {
        return new Promise((resolve, reject) => {
            const connectionId = uuidv4();
            const connectionType = this.determineConnectionType(strength);

            const sql = `
        INSERT OR REPLACE INTO connections (id, source_set_id, target_set_id, connection_type, strength)
        VALUES (?, ?, ?, ?, ?)
      `;

            db.run(sql, [connectionId, sourceId, targetId, connectionType, strength], (err) => {
                if (err) reject(err);
                else resolve(connectionId);
            });
        });
    }

    determineConnectionType(strength) {
        if (strength > 0.7) return 'strongly_related';
        if (strength > 0.5) return 'related';
        if (strength > 0.3) return 'loosely_related';
        return 'tangentially_related';
    }

    // Get graph data for visualization
    async getGraphData() {
        return new Promise((resolve, reject) => {
            // Get all sets as nodes
            db.all('SELECT * FROM sets', [], (err, sets) => {
                if (err) {
                    reject(err);
                    return;
                }

                // Get all connections as links
                db.all('SELECT * FROM connections', [], (err, connections) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    const graphData = {
                        nodes: sets.map(set => ({
                            id: set.id,
                            name: set.name,
                            subject: set.subject,
                            grade: set.grade,
                            difficulty: set.difficulty
                        })),
                        links: connections.map(conn => ({
                            source: conn.source_set_id,
                            target: conn.target_set_id,
                            type: conn.connection_type,
                            strength: conn.strength
                        }))
                    };

                    resolve(graphData);
                });
            });
        });
    }
}

module.exports = new KnowledgeGraph();
