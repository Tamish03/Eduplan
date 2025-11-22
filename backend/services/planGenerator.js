const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class PlanGenerator {
    async generateStudyPlan(setId, duration = 7, hoursPerDay = 2) {
        return new Promise((resolve, reject) => {
            const sql = `
        SELECT s.*, GROUP_CONCAT(d.filename) as documents
        FROM sets s
        LEFT JOIN documents d ON s.id = d.id
        WHERE s.id = ?
    GROUP BY s.id
      `;

            db.get(sql, [setId], async (err, set) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (!set) {
                    reject(new Error('Set not found'));
                    return;
                }

                // Get chunks to understand content
                const chunks = await this.getSetChunks(setId);

                // Generate plan based on content
                const plan = this.createPlan(set, chunks, duration, hoursPerDay);

                // Store the plan
                await this.storePlan(setId, plan);

                resolve(plan);
            });
        });
    }

    async getSetChunks(setId) {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT content FROM chunks WHERE set_id = ? LIMIT 20',
                [setId],
                (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                }
            );
        });
    }

    createPlan(set, chunks, duration, hoursPerDay) {
        const plan = {
            set_id: set.id,
            set_name: set.name,
            subject: set.subject,
            duration_days: duration,
            hours_per_day: hoursPerDay,
            total_hours: duration * hoursPerDay,
            study_plan: []
        };

        // Divide content across days
        const chunksPerDay = Math.ceil(chunks.length / duration);

        for (let day = 1; day <= duration; day++) {
            const dayPlan = {
                day,
                date: this.getDateForDay(day),
                objectives: this.generateObjectives(day, duration, set.subject),
                tasks: this.generateTasks(day, chunksPerDay, hoursPerDay),
                resources: set.documents ? set.documents.split(',') : [],
                estimated_time: `${hoursPerDay} hours`,
                difficulty: this.calculateDifficulty(day, duration)
            };

            plan.study_plan.push(dayPlan);
        }

        return plan;
    }

    getDateForDay(day) {
        const date = new Date();
        date.setDate(date.getDate() + day - 1);
        return date.toISOString().split('T')[0];
    }

    generateObjectives(day, totalDays, subject) {
        const phase = day <= totalDays / 3 ? 'introduction' :
            day <= (2 * totalDays) / 3 ? 'practice' : 'mastery';

        const objectives = {
            introduction: [
                `Understand fundamental concepts of ${subject}`,
                'Review key terminology and definitions',
                'Identify main topics and their relationships'
            ],
            practice: [
                'Apply concepts through practice problems',
                'Work through examples and case studies',
                'Test understanding with self-assessment'
            ],
            mastery: [
                'Synthesize knowledge across topics',
                'Complete comprehensive review',
                'Prepare for assessment or application'
            ]
        };

        return objectives[phase];
    }

    generateTasks(day, chunksPerDay, hoursPerDay) {
        const tasks = [];
        const timePerTask = Math.floor((hoursPerDay * 60) / 4); // 4 tasks per day

        tasks.push({
            task: 'Review study materials',
            duration: `${timePerTask} min`,
            type: 'reading',
            priority: 'high'
        });

        tasks.push({
            task: 'Take notes on key concepts',
            duration: `${timePerTask} min`,
            type: 'writing',
            priority: 'high'
        });

        tasks.push({
            task: 'Practice problems or exercises',
            duration: `${timePerTask} min`,
            type: 'practice',
            priority: 'medium'
        });

        tasks.push({
            task: 'Self-assessment and review',
            duration: `${timePerTask} min`,
            type: 'review',
            priority: 'medium'
        });

        return tasks;
    }

    calculateDifficulty(day, totalDays) {
        if (day <= totalDays / 3) return 'easy';
        if (day <= (2 * totalDays) / 3) return 'medium';
        return 'hard';
    }

    async storePlan(setId, plan) {
        return new Promise((resolve, reject) => {
            const planId = uuidv4();
            const sql = 'INSERT INTO study_plans (id, set_id, plan_data) VALUES (?, ?, ?)';

            db.run(sql, [planId, setId, JSON.stringify(plan)], (err) => {
                if (err) reject(err);
                else resolve(planId);
            });
        });
    }
}

module.exports = new PlanGenerator();
