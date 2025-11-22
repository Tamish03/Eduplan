import { NextRequest, NextResponse } from "next/server";
import { GeneratePlanRequest, StudyPlan, Set, DailyPlan, Activity } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: GeneratePlanRequest = await request.json();
    const { topic, duration, knowledgeLevel } = body;

    if (!topic || !duration || !knowledgeLevel) {
      return NextResponse.json(
        { error: "Missing required fields: topic, duration, knowledgeLevel" },
        { status: 400 }
      );
    }

    // Phase 1.1: Generate structured study plan using AI
    const prompt = `You are an expert curriculum designer. Create a comprehensive ${duration}-day study plan for learning "${topic}" at a ${knowledgeLevel} level.

Structure your response as a JSON object with the following format:
{
  "sets": [
    {
      "id": "set-1",
      "title": "Set Title",
      "description": "Detailed description",
      "concepts": ["concept1", "concept2"],
      "parentId": null or "parent-set-id",
      "relatedIds": ["related-set-id"],
      "difficulty": "${knowledgeLevel}",
      "estimatedTime": 120
    }
  ],
  "dailyPlans": [
    {
      "day": 1,
      "activities": [
        {
          "id": "activity-1",
          "setId": "set-1",
          "type": "read",
          "title": "Activity Title",
          "description": "Activity description",
          "duration": 45,
          "resources": ["Resource name or URL"]
        }
      ],
      "totalTime": 120,
      "learningGoals": ["Goal 1", "Goal 2"]
    }
  ]
}

Requirements:
- Create ${Math.ceil(duration / 3)} to ${Math.ceil(duration / 2)} learning Sets that cover the topic comprehensively
- Each Set should be a cohesive learning unit with clear concepts
- Establish parent-child relationships between Sets (e.g., "Advanced Concepts" depends on "Fundamentals")
- Link related Sets that share common themes
- Distribute activities across ${duration} days
- Include a mix of activity types: read, practice, project, review, quiz
- Adjust difficulty based on ${knowledgeLevel} level
- Total daily time should be 1-3 hours

Generate the complete study plan now:`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = JSON.parse(data.choices[0].message.content);

    // Construct the study plan
    const studyPlan: StudyPlan = {
      id: `plan-${Date.now()}`,
      topic,
      duration,
      knowledgeLevel,
      sets: generatedContent.sets || [],
      dailyPlans: generatedContent.dailyPlans || [],
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(studyPlan);
  } catch (error) {
    console.error("Error generating study plan:", error);
    return NextResponse.json(
      { error: "Failed to generate study plan" },
      { status: 500 }
    );
  }
}
