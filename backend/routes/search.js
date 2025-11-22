const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Search across all documents
router.post('/', (req, res) => {
    const { query, limit = 10 } = req.body;

    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    const sql = `
    SELECT c.*, d.filename, s.name as set_name, s.subject
    FROM chunks c
    JOIN documents d ON c.document_id = d.id
    JOIN sets s ON c.set_id = s.id
    WHERE c.content LIKE ?
    ORDER BY c.chunk_index
    LIMIT ?
  `;

    db.all(sql, [`%${query}%`, limit], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get related sets
router.get('/related/:setId', (req, res) => {
    const { setId } = req.params;

    const sql = `
    SELECT DISTINCT s.*, c.connection_type, c.strength
    FROM sets s
    JOIN connections c ON (s.id = c.target_set_id OR s.id = c.source_set_id)
    WHERE (c.source_set_id = ? OR c.target_set_id = ?) AND s.id != ?
    ORDER BY c.strength DESC
  `;

    db.all(sql, [setId, setId, setId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

module.exports = router;
