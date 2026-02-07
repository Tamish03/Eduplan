const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const ragEngine = require('./ragEngine');
const { generateGeminiResponse } = require('../utils/geminiClient');

function dbAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
    });
}

function dbGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
    });
}

function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function bucketHour(dateStr) {
    const d = new Date(dateStr);
    const h = d.getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    if (h < 21) return 'evening';
    return 'night';
}

function inferPrerequisite(topic = '') {
    const t = topic.toLowerCase();
    if (t.includes('algebra')) return 'Arithmetic operations and equation basics';
    if (t.includes('integration')) return 'Functions, derivatives, and limits';
    if (t.includes('mechanics')) return 'Vectors and Newtonian fundamentals';
    if (t.includes('thermo')) return 'Energy conservation and state variables';
    if (t.includes('grammar')) return 'Sentence structure and parts of speech';
    return 'Core fundamentals and definitions of this topic';
}

function fallbackExamQuestions(chunks, count) {
    const base = chunks.slice(0, count);
    return base.map((c, idx) => {
        const snippet = c.content.replace(/\s+/g, ' ').trim().slice(0, 120);
        return {
            id: `q${idx + 1}`,
            type: 'mcq',
            question: `Based on your material, which statement best matches: "${snippet}..."?`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            answer: 'A',
            explanation: 'Derived from uploaded source content.'
        };
    });
}

class AdvancedIntelligenceService {
    async computeLearningTwin(setId) {
        const sessions = await dbAll(
            `SELECT duration_minutes, activities, session_date FROM study_sessions WHERE set_id = ? ORDER BY session_date DESC`,
            [setId]
        );

        const quizzes = await dbAll(
            `SELECT score, completed_at FROM quiz_results WHERE set_id = ? ORDER BY completed_at DESC`,
            [setId]
        );

        const set = await dbGet('SELECT id, name, subject, grade, difficulty FROM sets WHERE id = ?', [setId]);
        if (!set) throw new Error('Set not found');

        const avgDuration = sessions.length
            ? Math.round(sessions.reduce((s, x) => s + Number(x.duration_minutes || 0), 0) / sessions.length)
            : 30;

        const slotCounts = { morning: 0, afternoon: 0, evening: 0, night: 0 };
        sessions.forEach((s) => {
            slotCounts[bucketHour(s.session_date)] += 1;
        });

        const bestTimeSlot = Object.entries(slotCounts).sort((a, b) => b[1] - a[1])[0][0];

        const modalityCounts = { reading: 0, practice: 0, quiz: 0, revision: 0 };
        sessions.forEach((s) => {
            const a = String(s.activities || '').toLowerCase();
            if (a.includes('read')) modalityCounts.reading += 1;
            if (a.includes('practice') || a.includes('problem')) modalityCounts.practice += 1;
            if (a.includes('quiz') || a.includes('test')) modalityCounts.quiz += 1;
            if (a.includes('revise') || a.includes('review')) modalityCounts.revision += 1;
        });

        const preferredModality = Object.entries(modalityCounts).sort((a, b) => b[1] - a[1])[0][0];

        const avgScore = quizzes.length
            ? Math.round(quizzes.reduce((s, q) => s + Number(q.score || 0), 0) / quizzes.length)
            : 0;

        const profile = {
            set_id: set.id,
            set_name: set.name,
            subject: set.subject,
            level: set.grade,
            baseline_difficulty: set.difficulty,
            avg_session_minutes: avgDuration,
            best_time_slot: bestTimeSlot,
            preferred_modality: preferredModality,
            mastery_score: avgScore,
            recommended_daily_minutes: avgScore < 60 ? Math.min(avgDuration + 20, 120) : avgDuration,
            adaptation_notes: avgScore < 60
                ? 'Reduce topic breadth and increase guided practice blocks.'
                : 'Maintain pace and add challenge questions for depth.'
        };

        const existing = await dbGet('SELECT id FROM learning_profiles WHERE set_id = ?', [setId]);
        if (existing) {
            await dbRun(
                'UPDATE learning_profiles SET profile_json = ?, updated_at = CURRENT_TIMESTAMP WHERE set_id = ?',
                [JSON.stringify(profile), setId]
            );
        } else {
            await dbRun(
                'INSERT INTO learning_profiles (id, set_id, profile_json) VALUES (?, ?, ?)',
                [uuidv4(), setId, JSON.stringify(profile)]
            );
        }

        return profile;
    }

    async getLearningTwin(setId) {
        const row = await dbGet('SELECT profile_json, updated_at FROM learning_profiles WHERE set_id = ?', [setId]);
        if (!row) {
            return this.computeLearningTwin(setId);
        }
        return { ...JSON.parse(row.profile_json), updated_at: row.updated_at };
    }

    async runHallucinationFirewall(query, setId = null) {
        const retrieval = await ragEngine.retrieveRelevantChunks(query, setId, 5);
        const evidenceCount = retrieval.results.length;
        const evidenceScore = evidenceCount
            ? retrieval.results.reduce((s, r) => s + Number(r.relevance_score || 0), 0) / evidenceCount
            : 0;

        const blocked = evidenceCount === 0 || evidenceScore < 0.35;

        if (blocked) {
            return {
                blocked: true,
                verdict: 'low-trust',
                trust_score: Number(evidenceScore.toFixed(3)),
                answer: 'I cannot provide a trusted answer yet because evidence from your uploaded material is insufficient.',
                evidence_count: evidenceCount,
                evidence: retrieval.results,
                recommendation: 'Upload more topic-specific documents or ask a narrower question.'
            };
        }

        const response = await ragEngine.generateAnswer(query, setId);
        const citationCoverage = response.sources?.length ? 1 : 0;
        const trustScore = Math.min(1, evidenceScore * 0.7 + citationCoverage * 0.3);

        return {
            blocked: false,
            verdict: trustScore >= 0.75 ? 'high-trust' : 'medium-trust',
            trust_score: Number(trustScore.toFixed(3)),
            evidence_count: evidenceCount,
            evidence: retrieval.results,
            ...response
        };
    }

    async detectBreakpoint(setId) {
        const rows = await dbAll('SELECT weak_areas, score FROM quiz_results WHERE set_id = ? ORDER BY completed_at DESC LIMIT 30', [setId]);
        if (!rows.length) {
            return {
                set_id: setId,
                breakpoint_topic: null,
                prerequisite_root: null,
                confidence: 0,
                remediation_path: ['Take a baseline quiz first to detect weak prerequisites.']
            };
        }

        const counts = {};
        rows.forEach((r) => {
            let areas = [];
            try {
                const parsed = JSON.parse(r.weak_areas || '[]');
                areas = Array.isArray(parsed) ? parsed : [];
            } catch {
                areas = String(r.weak_areas || '').split(',').map((x) => x.trim()).filter(Boolean);
            }
            areas.forEach((a) => {
                const key = a.toLowerCase();
                counts[key] = (counts[key] || 0) + 1;
            });
        });

        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        const breakpoint = sorted[0]?.[0] || null;
        const support = sorted[0]?.[1] || 0;
        const confidence = Math.min(1, support / Math.max(1, rows.length));
        const prerequisite = inferPrerequisite(breakpoint || '');

        return {
            set_id: setId,
            breakpoint_topic: breakpoint,
            prerequisite_root: prerequisite,
            confidence: Number(confidence.toFixed(2)),
            remediation_path: [
                `Rebuild prerequisite: ${prerequisite}`,
                `Do focused drills for: ${breakpoint}`,
                'Re-test after 48 hours using Exam Mode.'
            ]
        };
    }

    async generateExamSession(setId, numQuestions = 8) {
        const set = await dbGet('SELECT id, name, subject FROM sets WHERE id = ?', [setId]);
        if (!set) throw new Error('Set not found');

        const chunks = await dbAll('SELECT content FROM chunks WHERE set_id = ? LIMIT 25', [setId]);
        const material = chunks.length
            ? chunks
            : [{ content: `${set.name}. Subject: ${set.subject}. Create baseline assessment covering fundamentals, common mistakes, and core definitions.` }];

        let questions;
        try {
            const prompt = `Create ${numQuestions} multiple choice questions for ${set.subject} based only on this material. Return strict JSON array with fields: id, question, options (4), answer (A/B/C/D), explanation.\n\n${material.map((c, i) => `${i + 1}. ${c.content.slice(0, 500)}`).join('\n')}`;
            const text = await generateGeminiResponse(prompt, { temperature: 0.3, maxTokens: 1800 });
            const block = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
            const json = block?.[1] || text;
            questions = JSON.parse(json);
            if (!Array.isArray(questions) || !questions.length) throw new Error('Invalid question payload');
        } catch {
            questions = fallbackExamQuestions(material, numQuestions);
        }

        const normalized = questions.slice(0, numQuestions).map((q, idx) => ({
            id: q.id || `q${idx + 1}`,
            question: q.question,
            options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['A', 'B', 'C', 'D'],
            answer: ['A', 'B', 'C', 'D'].includes(q.answer) ? q.answer : 'A',
            explanation: q.explanation || 'No explanation provided.'
        }));

        const answerKey = {};
        normalized.forEach((q) => {
            answerKey[q.id] = q.answer;
        });

        const sessionId = uuidv4();
        await dbRun(
            'INSERT INTO exam_sessions (id, set_id, questions_json, answer_key_json, total_questions) VALUES (?, ?, ?, ?, ?)',
            [sessionId, setId, JSON.stringify(normalized), JSON.stringify(answerKey), normalized.length]
        );

        return {
            session_id: sessionId,
            set_id: setId,
            set_name: set.name,
            total_questions: normalized.length,
            questions: normalized.map((q) => ({ id: q.id, question: q.question, options: q.options }))
        };
    }

    async getExamSession(sessionId) {
        const row = await dbGet('SELECT * FROM exam_sessions WHERE id = ?', [sessionId]);
        if (!row) throw new Error('Exam session not found');

        return {
            session_id: row.id,
            set_id: row.set_id,
            total_questions: row.total_questions,
            questions: JSON.parse(row.questions_json).map((q) => ({ id: q.id, question: q.question, options: q.options })),
            submitted_at: row.submitted_at,
            score: row.score
        };
    }

    async submitExamSession(sessionId, answers) {
        const row = await dbGet('SELECT * FROM exam_sessions WHERE id = ?', [sessionId]);
        if (!row) throw new Error('Exam session not found');

        const key = JSON.parse(row.answer_key_json || '{}');
        const questions = JSON.parse(row.questions_json || '[]');

        let correct = 0;
        const result = questions.map((q) => {
            const userAnswer = answers?.[q.id] || null;
            const right = key[q.id] === userAnswer;
            if (right) correct += 1;
            return {
                id: q.id,
                question: q.question,
                selected: userAnswer,
                correct_answer: key[q.id],
                is_correct: right,
                explanation: q.explanation
            };
        });

        const total = questions.length;
        const score = total ? (correct / total) * 100 : 0;

        await dbRun(
            'UPDATE exam_sessions SET answers_json = ?, score = ?, submitted_at = CURRENT_TIMESTAMP WHERE id = ?',
            [JSON.stringify(answers || {}), score, sessionId]
        );

        return {
            session_id: sessionId,
            score: Number(score.toFixed(2)),
            correct,
            total,
            result,
            recommendation: score < 60
                ? 'Focus on prerequisite concepts and retry after targeted revision.'
                : 'Strong performance. Increase challenge level in next plan.'
        };
    }
}

module.exports = new AdvancedIntelligenceService();
