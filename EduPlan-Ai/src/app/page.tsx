"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MagicBento } from "@/components/ui/magic-bento";
import { Dock } from "@/components/ui/Dock";
import { BookOpen, Network, MessageSquare, Sparkles, Target, Zap, Home as HomeIcon, User, Settings, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const dockItems = [
    { icon: <HomeIcon size={18} />, label: 'Home', onClick: () => router.push('/') },
    { icon: <Calendar size={18} />, label: 'Planner', onClick: () => router.push('/planner') },
    { icon: <Network size={18} />, label: 'Knowledge Map', onClick: () => router.push('/knowledge-map') },
    { icon: <User size={18} />, label: 'Profile', onClick: () => {} },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-950 via-purple-950 to-cyan-950">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-magenta-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }} />
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 max-w-6xl relative z-10">
        <div className="text-center space-y-6 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 via-magenta-500 to-purple-400 bg-clip-text text-transparent">
              EduPlan AI
            </h1>
          </div>
          <p className="text-xl text-cyan-100/80 max-w-2xl mx-auto">
            Your intelligent study companion that creates personalized learning paths, 
            answers your questions, and visualizes knowledge connections
          </p>
          <div className="flex gap-4 justify-center pt-4 flex-wrap">
            <Link href="/planner">
              <MagicBento
                textAutoHide={true}
                enableStars={true}
                enableSpotlight={true}
                enableBorderGlow={true}
                enableTilt={true}
                enableMagnetism={true}
                clickEffect={true}
                spotlightRadius={300}
                particleCount={12}
                glowColor="6, 182, 212"
                className="inline-block"
              >
                <Button size="lg" className="gap-2 bg-gradient-to-r from-cyan-500 to-magenta-600 hover:from-cyan-400 hover:to-magenta-500 border-0">
                  <Target className="w-5 h-5" />
                  Start Learning
                </Button>
              </MagicBento>
            </Link>
            <Link href="/knowledge-map">
              <MagicBento
                textAutoHide={true}
                enableStars={true}
                enableSpotlight={true}
                enableBorderGlow={true}
                enableTilt={true}
                enableMagnetism={true}
                clickEffect={true}
                spotlightRadius={300}
                particleCount={12}
                glowColor="236, 72, 153"
                className="inline-block"
              >
                <Button size="lg" variant="outline" className="gap-2 border-2 border-magenta-500/50 bg-magenta-950/20 hover:bg-magenta-900/30 text-magenta-100">
                  <Network className="w-5 h-5" />
                  Explore Knowledge Graph
                </Button>
              </MagicBento>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <MagicBento
            textAutoHide={false}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={false}
            clickEffect={true}
            spotlightRadius={250}
            particleCount={8}
            glowColor="6, 182, 212"
            className="animate-in fade-in slide-in-from-left duration-700"
          >
            <Card className="border-2 border-cyan-500/30 bg-cyan-950/20 backdrop-blur-sm hover:border-cyan-400/50 transition-colors h-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/50">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-cyan-100">AI-Generated Curriculum</CardTitle>
                <CardDescription className="text-cyan-200/70">
                  Get personalized study plans tailored to your topic, timeline, and skill level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-cyan-100/60">
                  <li className="flex items-center gap-2 animate-in fade-in slide-in-from-left duration-500" style={{ animationDelay: '100ms' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Custom daily schedules
                  </li>
                  <li className="flex items-center gap-2 animate-in fade-in slide-in-from-left duration-500" style={{ animationDelay: '200ms' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Structured learning sets
                  </li>
                  <li className="flex items-center gap-2 animate-in fade-in slide-in-from-left duration-500" style={{ animationDelay: '300ms' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Mixed activity types
                  </li>
                </ul>
              </CardContent>
            </Card>
          </MagicBento>

          <MagicBento
            textAutoHide={false}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={false}
            clickEffect={true}
            spotlightRadius={250}
            particleCount={8}
            glowColor="168, 85, 247"
            className="animate-in fade-in slide-in-from-bottom duration-700"
            style={{ animationDelay: '100ms' }}
          >
            <Card className="border-2 border-purple-500/30 bg-purple-950/20 backdrop-blur-sm hover:border-purple-400/50 transition-colors h-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/50">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-purple-100">Intelligent Q&A</CardTitle>
                <CardDescription className="text-purple-200/70">
                  Ask questions about your study plan and get context-aware answers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-purple-100/60">
                  <li className="flex items-center gap-2 animate-in fade-in slide-in-from-left duration-500" style={{ animationDelay: '200ms' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    RAG-powered responses
                  </li>
                  <li className="flex items-center gap-2 animate-in fade-in slide-in-from-left duration-500" style={{ animationDelay: '300ms' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    Plan-specific guidance
                  </li>
                  <li className="flex items-center gap-2 animate-in fade-in slide-in-from-left duration-500" style={{ animationDelay: '400ms' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    Resource recommendations
                  </li>
                </ul>
              </CardContent>
            </Card>
          </MagicBento>

          <MagicBento
            textAutoHide={false}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={false}
            clickEffect={true}
            spotlightRadius={250}
            particleCount={8}
            glowColor="236, 72, 153"
            className="animate-in fade-in slide-in-from-right duration-700"
            style={{ animationDelay: '200ms' }}
          >
            <Card className="border-2 border-magenta-500/30 bg-magenta-950/20 backdrop-blur-sm hover:border-magenta-400/50 transition-colors h-full">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-magenta-500 to-magenta-600 flex items-center justify-center mb-4 shadow-lg shadow-magenta-500/50">
                  <Network className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-magenta-100">Knowledge Graph</CardTitle>
                <CardDescription className="text-magenta-200/70">
                  Visualize how concepts connect and build upon each other
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-magenta-100/60">
                  <li className="flex items-center gap-2 animate-in fade-in slide-in-from-left duration-500" style={{ animationDelay: '300ms' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-magenta-400" />
                    Interactive visualization
                  </li>
                  <li className="flex items-center gap-2 animate-in fade-in slide-in-from-left duration-500" style={{ animationDelay: '400ms' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-magenta-400" />
                    Relationship mapping
                  </li>
                  <li className="flex items-center gap-2 animate-in fade-in slide-in-from-left duration-500" style={{ animationDelay: '500ms' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-magenta-400" />
                    Learning pathways
                  </li>
                </ul>
              </CardContent>
            </Card>
          </MagicBento>
        </div>

        {/* How It Works */}
        <MagicBento
          textAutoHide={false}
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={false}
          enableMagnetism={false}
          clickEffect={true}
          spotlightRadius={300}
          particleCount={15}
          glowColor="236, 72, 153"
          className="animate-in fade-in zoom-in duration-700"
          style={{ animationDelay: '300ms' }}
        >
          <Card className="bg-gradient-to-br from-magenta-600 via-purple-600 to-cyan-600 text-white border-none">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">How EduPlan AI Works</CardTitle>
              <CardDescription className="text-cyan-100">
                Three simple steps to accelerated learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom duration-500" style={{ animationDelay: '400ms' }}>
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto text-2xl font-bold">
                    1
                  </div>
                  <h3 className="font-semibold">Define Your Goal</h3>
                  <p className="text-sm text-cyan-100">
                    Enter what you want to learn, how long you have, and your current level
                  </p>
                </div>
                <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom duration-500" style={{ animationDelay: '500ms' }}>
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto text-2xl font-bold">
                    2
                  </div>
                  <h3 className="font-semibold">Get Your Plan</h3>
                  <p className="text-sm text-cyan-100">
                    AI generates a comprehensive study plan with daily activities and resources
                  </p>
                </div>
                <div className="text-center space-y-3 animate-in fade-in slide-in-from-bottom duration-500" style={{ animationDelay: '600ms' }}>
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto text-2xl font-bold">
                    3
                  </div>
                  <h3 className="font-semibold">Learn & Explore</h3>
                  <p className="text-sm text-cyan-100">
                    Follow your plan, ask questions, and visualize concept relationships
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </MagicBento>

        {/* CTA Section */}
        <div className="text-center mt-16 space-y-4 animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: '400ms' }}>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-magenta-400 bg-clip-text text-transparent">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-cyan-100/70 max-w-xl mx-auto">
            Join thousands of learners who are mastering new skills with AI-powered study plans
          </p>
          <Link href="/planner">
            <MagicBento
              textAutoHide={true}
              enableStars={true}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={true}
              enableMagnetism={true}
              clickEffect={true}
              spotlightRadius={300}
              particleCount={12}
              glowColor="236, 72, 153"
              className="inline-block"
            >
              <Button size="lg" className="gap-2 bg-gradient-to-r from-magenta-500 to-purple-600 hover:from-magenta-400 hover:to-purple-500 border-0 shadow-lg shadow-magenta-500/50">
                <Zap className="w-5 h-5" />
                Create Your First Plan
              </Button>
            </MagicBento>
          </Link>
        </div>
      </div>

      {/* Dock Navigation */}
      <Dock 
        items={dockItems}
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
      />
    </div>
  );
}