import { NextRequest, NextResponse } from "next/server";
import { ChatRequest } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { messages, studyPlan } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    // Phase 1.2: RAG Q&A System - Use study plan context to answer questions
    const contextPrompt = studyPlan
      ? `You are an expert study assistant helping a student with their learning plan.

STUDY PLAN CONTEXT:
Topic: ${studyPlan.topic}
Duration: ${studyPlan.duration} days
Level: ${studyPlan.knowledgeLevel}

Learning Sets:
${studyPlan.sets.map((set, idx) => `${idx + 1}. ${set.title}: ${set.description}`).join('\n')}

Daily Schedule Overview:
${studyPlan.dailyPlans.map((day) => 
  `Day ${day.day}: ${day.activities.map(a => a.title).join(', ')} (${day.totalTime}m total)`
).join('\n')}

Use this context to provide helpful, specific answers about the student's learning journey. Reference specific sets, activities, and concepts from their plan when relevant. Provide actionable advice, clarifications, and additional insights.`
      : "You are a helpful study assistant. Answer questions about learning, study techniques, and educational topics.";

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: contextPrompt },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    return NextResponse.json({ message: assistantMessage });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
