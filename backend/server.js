const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const setsRoutes = require('./routes/sets');
const documentsRoutes = require('./routes/documents');
const ragRoutes = require('./routes/rag');
const searchRoutes = require('./routes/search');
const progressRoutes = require('./routes/progress');
const authRoutes = require('./routes/auth');
const advancedRoutes = require('./routes/advanced');

app.use('/api/sets', setsRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/rag', ragRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/advanced', advancedRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'RAG backend server is running' });
});

app.use('/api/*', (req, res) => {
    res.status(404).json({ error: `Route not found: ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong',
        message: err.message
    });
});

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`RAG backend server running on http://${HOST}:${PORT}`);
});

module.exports = app;
