import { NextRequest, NextResponse } from "next/server";
import { Set, NodeConnection } from "@/lib/types";

interface ConnectNodesRequest {
  sets: Set[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ConnectNodesRequest = await request.json();
    const { sets } = body;

    if (!sets || sets.length === 0) {
      return NextResponse.json(
        { error: "No sets provided" },
        { status: 400 }
      );
    }

    // Phase 2.2: Generate relationship mappings between learning sets
    const prompt = `You are a knowledge graph expert. Analyze these learning sets and create meaningful connections between them.

LEARNING SETS:
${sets.map((set, idx) => 
  `${idx + 1}. ID: ${set.id}
   Title: ${set.title}
   Concepts: ${set.concepts.join(", ")}
   Parent: ${set.parentId || "none"}
   Difficulty: ${set.difficulty}`
).join('\n\n')}

Generate connections in JSON format:
{
  "connections": [
    {
      "sourceId": "set-id-1",
      "targetId": "set-id-2",
      "relationship": "prerequisite|related|builds-on|similar",
      "strength": 0.8
    }
  ]
}

Relationship types:
- "prerequisite": Source must be learned before target
- "builds-on": Target extends concepts from source
- "related": Sets share common themes or concepts
- "similar": Sets cover similar topics at different levels

Strength (0-1): How strong the relationship is

Create 8-15 meaningful connections that form a coherent knowledge graph. Consider:
- Prerequisite chains (fundamentals → intermediate → advanced)
- Parallel topics that relate to each other
- Concepts that build upon previous knowledge
- Similar sets at different difficulty levels`;

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

    const connections: NodeConnection[] = generatedContent.connections;

    return NextResponse.json({ connections });
  } catch (error) {
    console.error("Error connecting nodes:", error);
    return NextResponse.json(
      { error: "Failed to generate node connections" },
      { status: 500 }
    );
  }
}
