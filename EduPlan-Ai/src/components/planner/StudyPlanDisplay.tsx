"use client";

import { useState } from "react";
import { StudyPlan, DailyPlan } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  Target, 
  BookOpen,
  CheckCircle2,
  PlayCircle,
  FileText,
  Code,
  Trophy
} from "lucide-react";

interface StudyPlanDisplayProps {
  studyPlan: StudyPlan;
}

const activityIcons = {
  read: BookOpen,
  practice: Code,
  project: Trophy,
  review: FileText,
  quiz: CheckCircle2,
};

const activityColors = {
  read: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  practice: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  project: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  review: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  quiz: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
};

export function StudyPlanDisplay({ studyPlan }: StudyPlanDisplayProps) {
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1]));

  const toggleDay = (day: number) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  };

  const totalTime = studyPlan.dailyPlans.reduce((sum, day) => sum + day.totalTime, 0);
  const avgDailyTime = Math.round(totalTime / studyPlan.dailyPlans.length);

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white border-none">
        <CardHeader>
          <CardTitle className="text-2xl">Your Learning Journey: {studyPlan.topic}</CardTitle>
          <CardDescription className="text-blue-100">
            Generated on {new Date(studyPlan.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{studyPlan.duration}</div>
              <div className="text-sm text-blue-100">Days</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold">{avgDailyTime}m</div>
              <div className="text-sm text-blue-100">Avg. Daily</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-3xl font-bold capitalize">{studyPlan.knowledgeLevel}</div>
              <div className="text-sm text-blue-100">Level</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Learning Sets */}
      {studyPlan.sets && studyPlan.sets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Learning Sets</CardTitle>
            <CardDescription>Key topics and concepts you'll master</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {studyPlan.sets.map((set) => (
                <div
                  key={set.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{set.title}</h4>
                    <Badge variant="outline" className="ml-2">
                      {set.estimatedTime}m
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{set.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {set.concepts.map((concept, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {concept}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Schedule</CardTitle>
          <CardDescription>Your day-by-day learning roadmap</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {studyPlan.dailyPlans.map((dailyPlan: DailyPlan) => (
            <Collapsible
              key={dailyPlan.day}
              open={expandedDays.has(dailyPlan.day)}
              onOpenChange={() => toggleDay(dailyPlan.day)}
            >
              <div className="border rounded-lg overflow-hidden">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-4 h-auto hover:bg-accent/50"
                  >
                    <div className="flex items-center gap-3">
                      {expandedDays.has(dailyPlan.day) ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                      <div className="text-left">
                        <div className="font-semibold">Day {dailyPlan.day}</div>
                        <div className="text-sm text-muted-foreground">
                          {dailyPlan.activities.length} activities
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{dailyPlan.totalTime}m</span>
                    </div>
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="p-4 pt-0 space-y-4">
                    {/* Learning Goals */}
                    {dailyPlan.learningGoals && dailyPlan.learningGoals.length > 0 && (
                      <div className="bg-accent/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">Today's Goals</span>
                        </div>
                        <ul className="space-y-1 ml-6">
                          {dailyPlan.learningGoals.map((goal, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground">
                              {goal}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Activities */}
                    <div className="space-y-3">
                      {dailyPlan.activities.map((activity) => {
                        const Icon = activityIcons[activity.type];
                        const colorClass = activityColors[activity.type];

                        return (
                          <div
                            key={activity.id}
                            className="border rounded-lg p-3 hover:border-primary/50 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${colorClass}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-medium">{activity.title}</h5>
                                  <Badge variant="outline" className="text-xs">
                                    {activity.duration}m
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {activity.description}
                                </p>
                                {activity.resources && activity.resources.length > 0 && (
                                  <div className="space-y-1">
                                    <div className="text-xs font-medium text-muted-foreground">
                                      Resources:
                                    </div>
                                    {activity.resources.map((resource, idx) => (
                                      <div
                                        key={idx}
                                        className="text-xs text-primary flex items-center gap-1"
                                      >
                                        <PlayCircle className="w-3 h-3" />
                                        {resource}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
