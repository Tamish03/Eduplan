const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');

// Get all sets
router.get('/', (req, res) => {
    db.all('SELECT * FROM sets ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get single set
router.get('/:id', (req, res) => {
    const { id } = req.params;

    db.get('SELECT * FROM sets WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Set not found' });
        }

        // Get documents for this set
        db.all('SELECT * FROM documents WHERE set_id = ?', [id], (err, docs) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ ...row, documents: docs });
        });
    });
});

// Create new set
router.post('/', (req, res) => {
    const { name, subject, grade, difficulty, description } = req.body;
    const id = uuidv4();

    const sql = `INSERT INTO sets (id, name, subject, grade, difficulty, description) 
               VALUES (?, ?, ?, ?, ?, ?)`;

    db.run(sql, [id, name, subject, grade, difficulty, description], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
            id,
            name,
            subject,
            grade,
            difficulty,
            description,
            created_at: new Date().toISOString()
        });
    });
});

// Update set
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, subject, grade, difficulty, description } = req.body;

    const sql = `UPDATE sets 
               SET name = ?, subject = ?, grade = ?, difficulty = ?, description = ?, updated_at = CURRENT_TIMESTAMP
               WHERE id = ?`;

    db.run(sql, [name, subject, grade, difficulty, description, id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Set not found' });
        }
        res.json({ message: 'Set updated successfully' });
    });
});

// Delete set
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM sets WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Set not found' });
        }
        res.json({ message: 'Set deleted successfully' });
    });
});

module.exports = router;
