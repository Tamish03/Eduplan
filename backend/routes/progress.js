const express = require('express');
const router = express.Router();
const progressAnalytics = require('../services/progressAnalytics');

// Get overall progress overview with all sets
router.get('/overview', async (req, res) => {
    try {
        const progressData = await progressAnalytics.getProgressOverview();
        const recommendations = await progressAnalytics.generateRecommendations(progressData);

        res.json({
            data: progressData,
            recommendations
        });
    } catch (error) {
        console.error('Error fetching progress overview:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get detailed gap analysis for a specific set
router.get('/gap-analysis/:setId', async (req, res) => {
    try {
        const { setId } = req.params;
        const gapAnalysis = await progressAnalytics.getSetGapAnalysis(setId);
        res.json(gapAnalysis);
    } catch (error) {
        console.error('Error fetching gap analysis:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get exam score analytics (exam mode + quiz history)
router.get('/exam-analysis', async (req, res) => {
    try {
        const { limit = 30 } = req.query;
        const data = await progressAnalytics.getExamScoreAnalysis(Number(limit));
        res.json(data);
    } catch (error) {
        console.error('Error fetching exam analysis:', error);
        res.status(500).json({ error: error.message });
    }
});

// Log a study session
router.post('/session', async (req, res) => {
    try {
        const { setId, durationMinutes, activities, notes } = req.body;

        if (!setId || !durationMinutes) {
            return res.status(400).json({ error: 'setId and durationMinutes are required' });
        }

        const result = await progressAnalytics.logStudySession(
            setId, 
            durationMinutes, 
            activities || '', 
            notes || ''
        );

        res.status(201).json(result);
    } catch (error) {
        console.error('Error logging study session:', error);
        res.status(500).json({ error: error.message });
    }
});

// Log a quiz result
router.post('/quiz', async (req, res) => {
    try {
        const { 
            setId, 
            topic, 
            score, 
            totalQuestions, 
            correctAnswers, 
            timeTaken, 
            weakAreas 
        } = req.body;

        if (!setId || score === undefined) {
            return res.status(400).json({ error: 'setId and score are required' });
        }

        const result = await progressAnalytics.logQuizResult(
            setId,
            topic || '',
            score,
            totalQuestions || 0,
            correctAnswers || 0,
            timeTaken || 0,
            weakAreas || []
        );

        res.status(201).json(result);
    } catch (error) {
        console.error('Error logging quiz result:', error);
        res.status(500).json({ error: error.message });
    }
});

// Log user interaction
router.post('/interaction', async (req, res) => {
    try {
        const { setId, interactionType, query, resultQuality } = req.body;

        if (!interactionType) {
            return res.status(400).json({ error: 'interactionType is required' });
        }

        const result = await progressAnalytics.logInteraction(
            setId || null,
            interactionType,
            query || '',
            resultQuality || null
        );

        res.status(201).json(result);
    } catch (error) {
        console.error('Error logging interaction:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
