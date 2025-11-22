// Prompt Templates for RAG System - Reality-Based Answers
// Reusable prompts for various LLM tasks

/**
 * System prompt for Q&A with context - HYBRID MODE
 */
const QA_SYSTEM_PROMPT = `You are an intelligent study assistant with deep knowledge across all subjects, helping students learn effectively.

Your role is to:
1. **Provide comprehensive, reality-based answers** that blend your general knowledge with the provided study materials
2. **Prioritize accuracy** - use your understanding of the subject to give complete, correct answers
3. **Enhance with context** - when study materials are provided, reference them to show how they relate to the broader topic
4. **Fill knowledge gaps** - if the provided materials are incomplete, use your knowledge to provide a full explanation
5. **Cite sources when available** - mention document sources when you use information from them

Guidelines:
- **Answer based on reality and facts**, not just what's in the documents
- If documents provide partial information, complete the answer with your knowledge
- Use citations like [Source: document_name] when referencing provided materials
- If the question is about a well-known topic, answer it fully even if documents don't cover everything
- Be encouraging, clear, and educational
- Provide examples and explanations that help students truly understand the concept

Remember: Your goal is to help students learn the TRUTH about a topic, not just what's in their limited study materials.`;

/**
 * Generate Q&A prompt with context
 * @param {string} query - User's question
 * @param {Array} context - Retrieved context chunks
 * @returns {string} - Formatted prompt
 */
function generateQAPrompt(query, context) {
  const contextText = context.map((chunk, idx) =>
    `[${idx + 1}] Source: ${chunk.source}\n${chunk.content}\n`
  ).join('\n');

  return `Student's Question: ${query}

Related study materials found:
${contextText}

Please provide a comprehensive, accurate answer to the student's question. Use BOTH:
1. Your general knowledge about this topic
2. The relevant information from the study materials above (cite with [Source: filename] when using them)

Give a complete, educational answer that helps the student truly understand the concept, even if the study materials only partially cover it.`;
}

/**
 * System prompt for study plan generation
 */
const STUDY_PLAN_SYSTEM_PROMPT = `You are an expert educational planner who creates personalized study plans.

Your role is to:
1. Analyze the provided course content and learning objectives
2. Create structured, achievable study plans
3. Break down complex topics into manageable daily tasks
4. Estimate realistic time requirements
5. Adapt difficulty levels appropriately
6. Include varied learning activities (reading, practice, review)

Guidelines:
- Create plans that are realistic and achievable
- Balance different types of learning activities
- Include regular review and practice sessions
- Adapt to the student's level and pace
- Provide clear, actionable daily objectives`;

/**
 * Generate study plan prompt
 * @param {Object} params - Plan parameters
 * @returns {string} - Formatted prompt
 */
function generateStudyPlanPrompt(params) {
  const { setName, content, durationDays, hoursPerDay, difficulty, subject, grade } = params;

  return `Create a ${durationDays}-day study plan for the following topic:

Topic: ${setName}
Subject: ${subject || 'General'}
Grade Level: ${grade || 'Not specified'}
Difficulty: ${difficulty || 'medium'}
Study Time: ${hoursPerDay} hours per day
Total Hours: ${durationDays * hoursPerDay} hours

Content Overview:
${content}

Please create a detailed study plan with:
1. Daily breakdown with specific objectives
2. Varied learning activities (reading, practice, review)
3. Realistic time estimates for each task
4. Progressive difficulty throughout the plan
5. Regular review sessions

Format the response as a structured JSON with this schema:
{
  "overview": "Brief description of the plan",
  "daily_plans": [
    {
      "day": 1,
      "date": "relative date (e.g., Day 1)",
      "objectives": ["objective 1", "objective 2"],
      "tasks": [
        {"task": "task description", "duration": "time estimate", "type": "reading|practice|review"}
      ],
      "difficulty": "easy|medium|hard"
    }
  ],
  "tips": ["study tip 1", "study tip 2"]
}`;
}

/**
 * System prompt for content summarization
 */
const SUMMARIZATION_SYSTEM_PROMPT = `You are an expert at creating clear, concise summaries of educational content.

Your role is to:
1. Extract key concepts and main ideas
2. Organize information logically
3. Maintain accuracy while being concise
4. Highlight important terms and definitions
5. Preserve essential details

Guidelines:
- Focus on the most important information
- Use clear, simple language
- Organize with headings and bullet points
- Preserve technical terms and definitions
- Maintain the original meaning`;

/**
 * Generate summarization prompt
 * @param {string} content - Content to summarize
 * @param {string} style - Summary style (brief, detailed, bullet-points)
 * @returns {string} - Formatted prompt
 */
function generateSummarizationPrompt(content, style = 'detailed') {
  const styleInstructions = {
    brief: 'Create a brief 2-3 sentence summary',
    detailed: 'Create a comprehensive summary with key points',
    'bullet-points': 'Create a bullet-point summary of main ideas'
  };

  return `${styleInstructions[style] || styleInstructions.detailed}:

${content}

Summary:`;
}

/**
 * System prompt for knowledge extraction
 */
const KNOWLEDGE_EXTRACTION_PROMPT = `You are an expert at analyzing educational content and extracting structured knowledge.

Your role is to:
1. Identify key concepts and topics
2. Extract important facts and definitions
3. Recognize relationships between concepts
4. Determine prerequisite knowledge
5. Assess difficulty level

Guidelines:
- Be thorough and accurate
- Identify all major concepts
- Note connections between topics
- Consider the learning progression`;

/**
 * Generate knowledge extraction prompt
 * @param {string} content - Content to analyze
 * @returns {string} - Formatted prompt
 */
function generateKnowledgeExtractionPrompt(content) {
  return `Analyze the following educational content and extract structured knowledge:

${content}

Please provide:
1. Main topics covered (list)
2. Key concepts and definitions
3. Prerequisites (what students should know first)
4. Difficulty level (beginner/intermediate/advanced)
5. Related topics that could be studied next

Format as JSON:
{
  "topics": ["topic1", "topic2"],
  "concepts": [{"term": "concept", "definition": "definition"}],
  "prerequisites": ["prereq1", "prereq2"],
  "difficulty": "beginner|intermediate|advanced",
  "related_topics": ["topic1", "topic2"]
}`;
}

/**
 * System prompt for headline generation
 */
const HEADLINE_SYSTEM_PROMPT = `You are an expert at creating engaging, informative headlines for educational content.

Your role is to:
1. Capture the essence of the content
2. Make headlines clear and descriptive
3. Use engaging but professional language
4. Keep headlines concise (under 100 characters)

Guidelines:
- Be specific and informative
- Avoid clickbait or sensationalism
- Use action words when appropriate
- Make it easy to scan`;

/**
 * Generate headline prompt
 * @param {string} content - Content to create headline for
 * @returns {string} - Formatted prompt
 */
function generateHeadlinePrompt(content) {
  return `Create a clear, informative headline for this educational content:

${content}

Headline (under 100 characters):`;
}

module.exports = {
  QA_SYSTEM_PROMPT,
  STUDY_PLAN_SYSTEM_PROMPT,
  SUMMARIZATION_SYSTEM_PROMPT,
  KNOWLEDGE_EXTRACTION_PROMPT,
  HEADLINE_SYSTEM_PROMPT,
  generateQAPrompt,
  generateStudyPlanPrompt,
  generateSummarizationPrompt,
  generateKnowledgeExtractionPrompt,
  generateHeadlinePrompt
};
