const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { generateGeminiResponse } = require('../utils/geminiClient');

// Search for educational resources on the internet using AI
router.post('/', async (req, res) => {
    const { query, limit = 10 } = req.body;

    console.log('Search request received:', { query, limit });

    if (!query) {
        console.log('No query provided');
        return res.status(400).json({ error: 'Query is required' });
    }

    try {
        console.log('Generating AI response for query:', query);
        
        // Use Gemini to generate curated educational resources
        const prompt = `You are an educational resource curator. A student is searching for: "${query}"

Please provide ${limit} high-quality educational resources for this topic. For each resource, provide:
1. Title (descriptive and clear)
2. Type (video, article, course, interactive, or tutorial)
3. Source (Khan Academy, Coursera, YouTube, MIT OCW, etc.)
4. URL (real, working educational websites)
5. Duration/Length estimate
6. Description (2-3 sentences explaining what the resource covers)
7. Rating (estimated quality score 3.5-5.0)
8. Difficulty (beginner, intermediate, or advanced)

Format your response as a JSON array with these exact fields:
[
  {
    "title": "Resource Title",
    "type": "video",
    "source": "Khan Academy",
    "url": "https://...",
    "duration": "15 min",
    "description": "Description here",
    "rating": 4.5,
    "difficulty": "beginner"
  }
]

Only return the JSON array, nothing else.`;

        const response = await generateGeminiResponse(prompt, { temperature: 0.7, maxTokens: 2000 });
        console.log('AI response received, length:', response.length);
        
        // Parse the JSON response
        let resources;
        try {
            // Extract JSON from markdown code blocks if present (supports CRLF/LF)
            const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
            const arrayMatch = response.match(/\[[\s\S]*\]/);
            const jsonString = codeBlockMatch?.[1] || arrayMatch?.[0] || response;
            resources = JSON.parse(jsonString);
            console.log('Successfully parsed', resources.length, 'resources');
        } catch (parseError) {
            console.error('Failed to parse AI response:', parseError);
            console.log('Raw response:', response.substring(0, 200));
            // Fallback to generic resources
            resources = generateFallbackResources(query);
            console.log('Using fallback resources:', resources.length);
        }

        res.json({ query, resources, total_found: resources.length });
    } catch (error) {
        console.error('Search error:', error.message);
        console.error('Error stack:', error.stack);
        // Return fallback resources on error
        const fallbackResources = generateFallbackResources(query);
        console.log('Returning fallback resources due to error');
        res.json({ query, resources: fallbackResources, total_found: fallbackResources.length });
    }
});

// Generate fallback resources when AI fails
function generateFallbackResources(query) {
    const topicName = query.charAt(0).toUpperCase() + query.slice(1);
    return [
        {
            title: `${topicName} - Khan Academy`,
            type: 'video',
            source: 'Khan Academy',
            url: `https://www.khanacademy.org/search?search_again=1&page_search_query=${encodeURIComponent(query)}`,
            duration: '10-20 min per video',
            description: 'Comprehensive video lessons with practice exercises covering fundamental concepts.',
            rating: 4.8,
            difficulty: 'beginner'
        },
        {
            title: `${topicName} Tutorial - YouTube`,
            type: 'video',
            source: 'YouTube',
            url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' tutorial')}`,
            duration: 'Varies',
            description: 'Video tutorials from various educators explaining key concepts with examples.',
            rating: 4.3,
            difficulty: 'beginner'
        },
        {
            title: `${topicName} - Wikipedia`,
            type: 'article',
            source: 'Wikipedia',
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(query.replace(/\s+/g, '_'))}`,
            duration: '5-10 min read',
            description: 'Comprehensive encyclopedia entry with definitions, history, and applications.',
            rating: 4.5,
            difficulty: 'intermediate'
        },
        {
            title: `${topicName} Course - Coursera`,
            type: 'course',
            source: 'Coursera',
            url: `https://www.coursera.org/search?query=${encodeURIComponent(query)}`,
            duration: '4-6 weeks',
            description: 'Structured online course from top universities with certificates available.',
            rating: 4.7,
            difficulty: 'intermediate'
        },
        {
            title: `${topicName} Practice - Brilliant.org`,
            type: 'interactive',
            source: 'Brilliant',
            url: `https://brilliant.org/courses/#/${encodeURIComponent(query)}`,
            duration: 'Self-paced',
            description: 'Interactive problem-solving exercises to build understanding through practice.',
            rating: 4.6,
            difficulty: 'intermediate'
        }
    ];
}

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
