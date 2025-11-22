"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { Set, NodeConnection } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Network, Info, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import MagicBento from "@/components/ui/MagicBento";
import Dock from "@/components/ui/Dock";
import { VscHome, VscArchive, VscAccount, VscSettingsGear } from "react-icons/vsc";
import { useRouter } from "next/navigation";

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[600px]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-8 h-8 text-cyan-500" />
      </motion.div>
    </div>
  ),
});

interface GraphNode {
  id: string;
  name: string;
  group: number;
  size: number;
  set: Set;
}

interface GraphLink {
  source: string;
  target: string;
  value: number;
  type: string;
}

interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export default function KnowledgeMapPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<Set | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateKnowledgeGraph = async () => {
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const planResponse = await fetch("/api/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic.trim(),
          duration: 14,
          knowledgeLevel: "intermediate",
        }),
      });

      if (!planResponse.ok) {
        throw new Error("Failed to generate knowledge graph");
      }

      const studyPlan = await planResponse.json();
      const sets: Set[] = studyPlan.sets;

      const connectResponse = await fetch("/api/connect-nodes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sets }),
      });

      if (!connectResponse.ok) {
        throw new Error("Failed to generate connections");
      }

      const { connections } = await connectResponse.json();

      const nodes: GraphNode[] = sets.map((set, idx) => ({
        id: set.id,
        name: set.title,
        group: set.difficulty === "beginner" ? 1 : set.difficulty === "intermediate" ? 2 : 3,
        size: set.concepts.length * 3 + 10,
        set,
      }));

      const links: GraphLink[] = connections.map((conn: NodeConnection) => ({
        source: conn.sourceId,
        target: conn.targetId,
        value: conn.strength * 5,
        type: conn.relationship,
      }));

      setGraphData({ nodes, links });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node.set);
  }, []);

  const getNodeColor = (node: GraphNode) => {
    switch (node.group) {
      case 1:
        return "#06b6d4"; // Cyan for beginner
      case 2:
        return "#a855f7"; // Purple for intermediate
      case 3:
        return "#ec4899"; // Magenta for advanced
      default:
        return "#6b7280";
    }
  };

  const getLinkColor = (link: GraphLink) => {
    switch (link.type) {
      case "prerequisite":
        return "#ec4899"; // Magenta
      case "builds-on":
        return "#d946ef"; // Fuchsia
      case "related":
        return "#06b6d4"; // Cyan
      case "similar":
        return "#8b5cf6"; // Purple
      default:
        return "#9ca3af";
    }
  };

  const dockItems = [
    { icon: <VscHome size={18} />, label: 'Home', onClick: () => router.push('/') },
    { icon: <VscArchive size={18} />, label: 'Planner', onClick: () => router.push('/planner') },
    { icon: <VscAccount size={18} />, label: 'Profile', onClick: () => {} },
    { icon: <VscSettingsGear size={18} />, label: 'Settings', onClick: () => {} },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-cyan-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-magenta-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 mb-2 transition-colors">
            ← Back to Home
          </Link>
          <motion.h1 
            className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-magenta-400 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="inline-block w-10 h-10 mr-3 text-cyan-400" />
            Knowledge Graph Explorer
          </motion.h1>
          <motion.p 
            className="text-gray-300 mt-2 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Visualize learning paths and concept relationships with AI-powered insights
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Search & Info */}
          <motion.div 
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Search Card */}
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
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  >
                    <Network className="w-6 h-6 text-cyan-400" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-white">Generate Graph</h2>
                </div>
                <p className="text-gray-400 text-sm">
                  Enter a topic to visualize its knowledge structure
                </p>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., React, Calculus, Piano..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && generateKnowledgeGraph()}
                    disabled={isLoading}
                    className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-400 transition-colors"
                  />
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={generateKnowledgeGraph}
                      disabled={isLoading || !topic.trim()}
                      size="icon"
                      className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </Button>
                  </motion.div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-md"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Legend */}
                {graphData && (
                  <motion.div 
                    className="space-y-3 pt-4 border-t border-white/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="font-medium text-sm flex items-center gap-2 text-cyan-400">
                      <Info className="w-4 h-4" />
                      Legend
                    </div>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <div className="font-medium mb-2 text-white">Difficulty Levels:</div>
                        <div className="flex flex-col gap-2">
                          <motion.div 
                            className="flex items-center gap-2"
                            whileHover={{ x: 5 }}
                          >
                            <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50" />
                            <span className="text-xs text-gray-300">Beginner</span>
                          </motion.div>
                          <motion.div 
                            className="flex items-center gap-2"
                            whileHover={{ x: 5 }}
                          >
                            <div className="w-3 h-3 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50" />
                            <span className="text-xs text-gray-300">Intermediate</span>
                          </motion.div>
                          <motion.div 
                            className="flex items-center gap-2"
                            whileHover={{ x: 5 }}
                          >
                            <div className="w-3 h-3 rounded-full bg-magenta-500 shadow-lg shadow-magenta-500/50" />
                            <span className="text-xs text-gray-300">Advanced</span>
                          </motion.div>
                        </div>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium mb-2 text-white">Relationships:</div>
                        <div className="flex flex-col gap-2">
                          <motion.div 
                            className="flex items-center gap-2"
                            whileHover={{ x: 5 }}
                          >
                            <div className="w-8 h-0.5 bg-magenta-500 shadow-lg shadow-magenta-500/50" />
                            <span className="text-xs text-gray-300">Prerequisite</span>
                          </motion.div>
                          <motion.div 
                            className="flex items-center gap-2"
                            whileHover={{ x: 5 }}
                          >
                            <div className="w-8 h-0.5 bg-fuchsia-500 shadow-lg shadow-fuchsia-500/50" />
                            <span className="text-xs text-gray-300">Builds-on</span>
                          </motion.div>
                          <motion.div 
                            className="flex items-center gap-2"
                            whileHover={{ x: 5 }}
                          >
                            <div className="w-8 h-0.5 bg-cyan-500 shadow-lg shadow-cyan-500/50" />
                            <span className="text-xs text-gray-300">Related</span>
                          </motion.div>
                          <motion.div 
                            className="flex items-center gap-2"
                            whileHover={{ x: 5 }}
                          >
                            <div className="w-8 h-0.5 bg-purple-500 shadow-lg shadow-purple-500/50" />
                            <span className="text-xs text-gray-300">Similar</span>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </MagicBento>

            {/* Selected Node Details */}
            <AnimatePresence>
              {selectedNode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <MagicBento
                    textAutoHide={false}
                    enableStars={true}
                    enableSpotlight={true}
                    enableBorderGlow={true}
                    enableTilt={true}
                    clickEffect={false}
                    spotlightRadius={200}
                    particleCount={8}
                    glowColor="236, 72, 153"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-xl font-bold text-white">{selectedNode.title}</h3>
                        <Zap className="w-5 h-5 text-magenta-400" />
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="capitalize border-cyan-400/50 text-cyan-400 bg-cyan-400/10">
                          {selectedNode.difficulty}
                        </Badge>
                        <Badge variant="outline" className="border-purple-400/50 text-purple-400 bg-purple-400/10">
                          {selectedNode.estimatedTime}m
                        </Badge>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-1 text-cyan-400">Description</div>
                        <p className="text-sm text-gray-300">
                          {selectedNode.description}
                        </p>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-2 text-cyan-400">Key Concepts</div>
                        <div className="flex flex-wrap gap-2">
                          {selectedNode.concepts.map((concept, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.05 }}
                            >
                              <Badge 
                                variant="secondary" 
                                className="text-xs bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-white/10 text-white"
                              >
                                {concept}
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </MagicBento>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Right Column: Graph Visualization */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <MagicBento
              textAutoHide={false}
              enableStars={true}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={false}
              clickEffect={false}
              spotlightRadius={400}
              particleCount={20}
              glowColor="168, 85, 247"
              className="h-full"
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ 
                      rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                      scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <Loader2 className="w-12 h-12 text-cyan-400" />
                  </motion.div>
                  <div className="text-center">
                    <motion.p 
                      className="text-lg font-medium text-white"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Building Knowledge Graph...
                    </motion.p>
                    <p className="text-sm text-gray-400 mt-2">
                      Analyzing concepts and relationships
                    </p>
                  </div>
                </div>
              ) : graphData ? (
                <div className="relative">
                  <ForceGraph2D
                    graphData={graphData}
                    nodeLabel="name"
                    nodeColor={getNodeColor}
                    nodeRelSize={6}
                    linkColor={getLinkColor}
                    linkWidth={(link: any) => link.value}
                    linkDirectionalParticles={2}
                    linkDirectionalParticleWidth={(link: any) => link.value}
                    onNodeClick={handleNodeClick}
                    width={800}
                    height={600}
                    backgroundColor="rgba(0,0,0,0)"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[600px] text-center">
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <Network className="w-16 h-16 text-cyan-400 mb-4" />
                  </motion.div>
                  <h3 className="text-2xl font-semibold mb-2 text-white">Ready to Explore?</h3>
                  <p className="text-gray-400 max-w-md">
                    Enter a topic on the left to generate an interactive knowledge graph showing
                    how concepts connect and build upon each other
                  </p>
                </div>
              )}
            </MagicBento>
          </motion.div>
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