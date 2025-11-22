"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { GeneratePlanRequest, KnowledgeLevel, StudyPlan } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface PlannerFormProps {
  onPlanGenerated: (plan: StudyPlan) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function PlannerForm({ onPlanGenerated, isLoading, setIsLoading }: PlannerFormProps) {
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, setValue, watch } = useForm<GeneratePlanRequest>({
    defaultValues: {
      topic: "",
      duration: 7,
      knowledgeLevel: "beginner",
    },
  });

  const knowledgeLevel = watch("knowledgeLevel");

  const onSubmit = async (data: GeneratePlanRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to generate study plan");
      }

      const studyPlan: StudyPlan = await response.json();
      onPlanGenerated(studyPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          Create Your Plan
        </CardTitle>
        <CardDescription>
          Tell us what you want to learn and we'll create a personalized curriculum
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Topic Input */}
          <div className="space-y-2">
            <Label htmlFor="topic">What do you want to learn?</Label>
            <Input
              id="topic"
              placeholder="e.g., Machine Learning, Spanish, Guitar..."
              {...register("topic", { required: true })}
              disabled={isLoading}
            />
          </div>

          {/* Duration Input */}
          <div className="space-y-2">
            <Label htmlFor="duration">Study Duration (days)</Label>
            <Input
              id="duration"
              type="number"
              min="1"
              max="365"
              placeholder="7"
              {...register("duration", { required: true, valueAsNumber: true })}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Recommended: 7-30 days for most topics
            </p>
          </div>

          {/* Knowledge Level Select */}
          <div className="space-y-2">
            <Label htmlFor="knowledgeLevel">Your Current Level</Label>
            <Select
              value={knowledgeLevel}
              onValueChange={(value: KnowledgeLevel) => setValue("knowledgeLevel", value)}
              disabled={isLoading}
            >
              <SelectTrigger id="knowledgeLevel">
                <SelectValue placeholder="Select your level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner - Just starting out</SelectItem>
                <SelectItem value="intermediate">Intermediate - Some experience</SelectItem>
                <SelectItem value="advanced">Advanced - Deep knowledge</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Study Plan
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
