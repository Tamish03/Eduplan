// Core data structure types for EduPlan AI

export type KnowledgeLevel = "beginner" | "intermediate" | "advanced";

export interface Set {
  id: string;
  title: string;
  description: string;
  concepts: string[];
  parentId?: string;
  relatedIds: string[];
  difficulty: KnowledgeLevel;
  estimatedTime: number; // in minutes
}

export interface Activity {
  id: string;
  setId: string;
  type: "read" | "practice" | "project" | "review" | "quiz";
  title: string;
  description: string;
  duration: number; // in minutes
  resources: string[];
}

export interface DailyPlan {
  day: number;
  date?: string;
  activities: Activity[];
  totalTime: number;
  learningGoals: string[];
}

export interface StudyPlan {
  id: string;
  topic: string;
  duration: number; // in days
  knowledgeLevel: KnowledgeLevel;
  dailyPlans: DailyPlan[];
  sets: Set[];
  createdAt: string;
}

export interface GeneratePlanRequest {
  topic: string;
  duration: number;
  knowledgeLevel: KnowledgeLevel;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  studyPlan?: StudyPlan;
}

export interface ContentResource {
  id: string;
  title: string;
  type: "article" | "video" | "tutorial" | "book" | "course";
  url: string;
  description: string;
  difficulty: KnowledgeLevel;
  estimatedTime: number;
}

export interface NodeConnection {
  sourceId: string;
  targetId: string;
  relationship: "prerequisite" | "related" | "builds-on" | "similar";
  strength: number; // 0-1
}
