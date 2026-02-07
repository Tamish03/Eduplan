const express = require('express');
const router = express.Router();
const advanced = require('../services/advancedIntelligence');

router.get('/learning-twin/:setId', async (req, res) => {
    try {
        const { setId } = req.params;
        const data = await advanced.getLearningTwin(setId);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/learning-twin/:setId/recompute', async (req, res) => {
    try {
        const { setId } = req.params;
        const data = await advanced.computeLearningTwin(setId);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/safe-query', async (req, res) => {
    try {
        const { query, setId = null } = req.body;
        if (!query) return res.status(400).json({ error: 'query is required' });
        const data = await advanced.runHallucinationFirewall(query, setId);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/breakpoint/:setId', async (req, res) => {
    try {
        const { setId } = req.params;
        const data = await advanced.detectBreakpoint(setId);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/exam/generate/:setId', async (req, res) => {
    try {
        const { setId } = req.params;
        const { numQuestions = 8 } = req.body;
        const data = await advanced.generateExamSession(setId, Number(numQuestions));
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/exam/session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const data = await advanced.getExamSession(sessionId);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/exam/submit/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { answers = {} } = req.body;
        const data = await advanced.submitExamSession(sessionId, answers);
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
