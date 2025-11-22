import { NextRequest, NextResponse } from "next/server";
import { ContentResource, KnowledgeLevel } from "@/lib/types";

interface FindContentRequest {
  setId: string;
  setTitle: string;
  concepts: string[];
  difficulty: KnowledgeLevel;
}

export async function POST(request: NextRequest) {
  try {
    const body: FindContentRequest = await request.json();
    const { setId, setTitle, concepts, difficulty } = body;

    if (!setId || !setTitle) {
      return NextResponse.json(
        { error: "Missing required fields: setId, setTitle" },
        { status: 400 }
      );
    }

    // Phase 2.1: Generate mock learning resources using AI
    const prompt = `You are a learning resource curator. Generate a list of high-quality learning resources for the following learning set:

Title: ${setTitle}
Concepts: ${concepts.join(", ")}
Difficulty: ${difficulty}

Generate 5-8 diverse learning resources in JSON format:
{
  "resources": [
    {
      "id": "resource-1",
      "title": "Resource Title",
      "type": "article|video|tutorial|book|course",
      "url": "https://example.com/resource",
      "description": "Brief description of what the learner will gain",
      "difficulty": "${difficulty}",
      "estimatedTime": 30
    }
  ]
}

Include a mix of:
- Articles (free online articles)
- Videos (YouTube, educational platforms)
- Interactive tutorials
- Books (both free and premium)
- Online courses

Make the URLs realistic (use real platforms like YouTube, Medium, Khan Academy, Coursera, etc.) and the content relevant to the concepts. Adjust difficulty appropriately.`;

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

    const resources: ContentResource[] = generatedContent.resources.map((r: any) => ({
      ...r,
      id: `${setId}-${r.id}`,
    }));

    return NextResponse.json({ resources });
  } catch (error) {
    console.error("Error finding content:", error);
    return NextResponse.json(
      { error: "Failed to find learning content" },
      { status: 500 }
    );
  }
}
