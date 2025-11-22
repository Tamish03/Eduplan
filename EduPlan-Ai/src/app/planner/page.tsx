"use client";

import { useState } from "react";
import { StudyPlan } from "@/lib/types";
import { PlannerForm } from "@/components/planner/PlannerForm";
import { StudyPlanDisplay } from "@/components/planner/StudyPlanDisplay";
import { ChatInterface } from "@/components/planner/ChatInterface";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function PlannerPage() {
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-2">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI Study Planner
            </h1>
            <p className="text-muted-foreground mt-2">
              Generate personalized learning paths tailored to your goals
            </p>
          </div>
          <Link href="/knowledge-map">
            <Button variant="outline" size="lg">
              <BookOpen className="w-4 h-4 mr-2" />
              Knowledge Map
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Form */}
          <div className="lg:col-span-1">
            <PlannerForm
              onPlanGenerated={setStudyPlan}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </div>

          {/* Right Column: Study Plan Display */}
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-lg font-medium">Generating your personalized study plan...</p>
                  <p className="text-sm text-muted-foreground">This may take a moment</p>
                </div>
              </div>
            ) : studyPlan ? (
              <div className="space-y-6">
                <StudyPlanDisplay studyPlan={studyPlan} />
                
                {/* Chat Toggle Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={() => setShowChat(!showChat)}
                    size="lg"
                    className="gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    {showChat ? "Hide Q&A Assistant" : "Ask Questions About Your Plan"}
                  </Button>
                </div>

                {/* Chat Interface */}
                {showChat && (
                  <ChatInterface studyPlan={studyPlan} />
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Ready to Start Learning?</h3>
                <p className="text-muted-foreground">
                  Fill out the form to generate your personalized study plan
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
