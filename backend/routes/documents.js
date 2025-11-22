const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const documentProcessor = require('../services/documentProcessor');

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// Upload document to set
router.post('/upload/:setId', upload.single('document'), async (req, res) => {
    try {
        const { setId } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const documentId = uuidv4();

        // Save document metadata
        const sql = `INSERT INTO documents (id, set_id, filename, filepath, file_type, file_size) 
                 VALUES (?, ?, ?, ?, ?, ?)`;

        db.run(sql, [
            documentId,
            setId,
            file.originalname,
            file.path,
            file.mimetype,
            file.size
        ], async function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            // Process document (extract text, chunk, create embeddings)
            try {
                await documentProcessor.processDocument(documentId, setId, file.path, file.mimetype);

                res.status(201).json({
                    id: documentId,
                    filename: file.originalname,
                    message: 'Document uploaded and processed successfully'
                });
            } catch (processErr) {
                console.error('Error processing document:', processErr);
                res.status(500).json({ error: 'Document uploaded but processing failed' });
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get documents for a set
router.get('/set/:setId', (req, res) => {
    const { setId } = req.params;

    db.all('SELECT * FROM documents WHERE set_id = ?', [setId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Delete document
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM documents WHERE id = ?', [id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }
        res.json({ message: 'Document deleted successfully' });
    });
});

module.exports = router;
