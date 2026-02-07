const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const documentProcessor = require('../services/documentProcessor');
const knowledgeGraph = require('../services/knowledgeGraph');

const ALLOWED_MIME_TYPES = new Set(['application/pdf', 'text/plain']);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
            cb(new Error('Only PDF and TXT files are supported right now.'));
            return;
        }
        cb(null, true);
    }
});

router.post('/upload/:setId', upload.single('document'), async (req, res) => {
    try {
        const { setId } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const documentId = uuidv4();

        const sql = `
            INSERT INTO documents (id, set_id, filename, filepath, file_type, file_size)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        db.run(sql, [documentId, setId, file.originalname, file.path, file.mimetype, file.size], async (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            try {
                await documentProcessor.processDocument(documentId, setId, file.path, file.mimetype);
                await knowledgeGraph.buildConnections(setId);

                res.status(201).json({
                    id: documentId,
                    filename: file.originalname,
                    message: 'Document uploaded and processed successfully'
                });
            } catch (processErr) {
                console.error('Error processing document:', processErr);
                res.status(500).json({ error: `Document uploaded but processing failed: ${processErr.message}` });
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/set/:setId', (req, res) => {
    const { setId } = req.params;

    db.all('SELECT * FROM documents WHERE set_id = ? ORDER BY uploaded_at DESC', [setId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

router.delete('/:id', (req, res) => {
    const { id } = req.params;

    db.get('SELECT id, filepath FROM documents WHERE id = ?', [id], async (lookupErr, row) => {
        if (lookupErr) {
            return res.status(500).json({ error: lookupErr.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Document not found' });
        }

        try {
            await documentProcessor.deleteDocument(id);

            db.run('DELETE FROM documents WHERE id = ?', [id], function (deleteErr) {
                if (deleteErr) {
                    return res.status(500).json({ error: deleteErr.message });
                }

                if (row.filepath && fs.existsSync(row.filepath)) {
                    fs.unlink(row.filepath, () => {});
                }

                res.json({ message: 'Document deleted successfully' });
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
});

module.exports = router;
