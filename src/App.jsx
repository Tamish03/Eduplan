import React, { useState } from 'react';
import { Brain, Search, BarChart3, Zap } from 'lucide-react';
import GraphView from './components/GraphView';
import SetDetailView from './components/SetDetailView';
import HeadlineSidebar from './components/HeadlineSidebar';
import ProgressView from './components/ProgressView';
import ContentFinder from './components/ContentFinder';
import RAGTestUI from './components/RAGTestUI';

function App() {
    const [activeTab, setActiveTab] = useState('map');
    const [selectedNode, setSelectedNode] = useState(null);

    const handleNodeClick = (node) => {
        setSelectedNode(node);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
            {/* Top Navigation Bar */}
            <nav className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-md fixed w-full z-50">
                <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    EduPlanner
                </div>

                <div className="flex gap-8">
                    <NavIcon
                        icon={<Brain size={24} />}
                        label="Planner & Map"
                        active={activeTab === 'map'}
                        onClick={() => setActiveTab('map')}
                    />
                    <NavIcon
                        icon={<Search size={24} />}
                        label="Content Finder"
                        active={activeTab === 'content'}
                        onClick={() => setActiveTab('content')}
                    />
                    <NavIcon
                        icon={<BarChart3 size={24} />}
                        label="Progress"
                        active={activeTab === 'progress'}
                        onClick={() => setActiveTab('progress')}
                    />
                    <NavIcon
                        icon={<Zap size={24} />}
                        label="RAG Test"
                        active={activeTab === 'rag-test'}
                        onClick={() => setActiveTab('rag-test')}
                    />
                </div>

                <div className="w-20" /> {/* Spacer for balance */}
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 pt-16 relative h-screen overflow-hidden">
                {activeTab === 'map' && (
                    <>
                        <HeadlineSidebar />
                        <GraphView onNodeClick={handleNodeClick} />
                        {selectedNode && (
                            <SetDetailView
                                node={selectedNode}
                                onClose={() => setSelectedNode(null)}
                            />
                        )}
                    </>
                )}
                {activeTab === 'content' && <ContentFinder />}
                {activeTab === 'progress' && <ProgressView />}
                {activeTab === 'rag-test' && <RAGTestUI />}
            </main>
        </div>
    );
}

function NavIcon({ icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
                }`}
        >
            {icon}
            <span className="text-xs font-medium">{label}</span>
        </button>
    );
}

export default App;
