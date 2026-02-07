import React, { useState, useEffect, useMemo } from 'react';
import { Brain, Search, BarChart3, Zap, LogOut, Command, Server, X } from 'lucide-react';
import GraphView from './components/GraphView';
import SetDetailView from './components/SetDetailView';
import HeadlineSidebar from './components/HeadlineSidebar';
import ProgressView from './components/ProgressView';
import ContentFinder from './components/ContentFinder';
import RAGTestUI from './components/RAGTestUI';
import AuthContainer from './components/auth/AuthContainer';
import Tour from './components/Tour';
import WelcomeModal from './components/WelcomeModal';
import { healthCheck, setsAPI } from './services/api';

function App() {
    const [activeTab, setActiveTab] = useState('map');
    const [selectedNode, setSelectedNode] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [showTour, setShowTour] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [backendStatus, setBackendStatus] = useState('checking');
    const [quickActionsOpen, setQuickActionsOpen] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const authToken = localStorage.getItem('authToken');

        if (storedUser && authToken) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            const hasSeenTour = localStorage.getItem('hasSeenTour');
            if (!hasSeenTour) {
                setTimeout(() => setShowWelcome(true), 800);
            }
        }
    }, [isAuthenticated]);

    useEffect(() => {
        const checkBackend = async () => {
            try {
                await healthCheck();
                setBackendStatus('online');
            } catch {
                setBackendStatus('offline');
            }
        };

        checkBackend();
        const interval = setInterval(checkBackend, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handler = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setQuickActionsOpen((prev) => !prev);
            }
            if (event.key === 'Escape') {
                setQuickActionsOpen(false);
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const quickActions = useMemo(
        () => [
            { id: 'map', label: 'Go to Planner & Map', run: () => setActiveTab('map') },
            { id: 'content', label: 'Go to Content Finder', run: () => setActiveTab('content') },
            { id: 'progress', label: 'Go to Progress', run: () => setActiveTab('progress') },
            { id: 'brainstorm', label: 'Go to Brainstorm', run: () => setActiveTab('rag-test') },
            {
                id: 'tour',
                label: 'Restart Product Tour',
                run: () => {
                    setShowWelcome(false);
                    setShowTour(true);
                }
            }
        ],
        []
    );

    const handleLogin = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
    };

    const handleStartTour = () => {
        setShowWelcome(false);
        setTimeout(() => setShowTour(true), 300);
    };

    const handleWelcomeSkip = () => {
        setShowWelcome(false);
        localStorage.setItem('hasSeenTour', 'true');
    };

    const handleTourComplete = () => {
        setShowTour(false);
        localStorage.setItem('hasSeenTour', 'true');
    };

    const handleTourSkip = () => {
        setShowTour(false);
        localStorage.setItem('hasSeenTour', 'true');
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        setUser(null);
        setIsAuthenticated(false);
        setActiveTab('map');
    };

    const handleNodeClick = async (node) => {
        try {
            const response = await setsAPI.getById(node.id);
            setSelectedNode(response.data);
        } catch (error) {
            console.error('Error fetching set details:', error);
            setSelectedNode(node);
        }
    };

    if (!isAuthenticated) {
        return <AuthContainer onLogin={handleLogin} />;
    }

    return (
        <div className="min-h-screen text-white flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-white to-green-500 opacity-90" />
                <div className="absolute -top-20 -left-16 w-64 h-64 rounded-full bg-orange-500/10 blur-3xl" />
                <div className="absolute -top-24 right-0 w-72 h-72 rounded-full bg-green-500/10 blur-3xl" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[36rem] h-48 rounded-full bg-sky-500/10 blur-3xl" />
            </div>

            <nav className="h-20 border-b border-slate-800 flex items-center justify-between px-4 md:px-6 bg-slate-900/65 backdrop-blur-md fixed w-full z-50">
                <div className="min-w-[210px]">
                    <div className="text-xl font-bold bg-gradient-to-r from-orange-400 via-slate-100 to-green-400 bg-clip-text text-transparent">
                        EduPlan Bharat AI
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400 whitespace-nowrap">
                        <span>Learn</span>
                        <span className="mx-1.5 text-orange-300">•</span>
                        <span>Connect</span>
                        <span className="mx-1.5 text-white">•</span>
                        <span>Build</span>
                    </div>
                </div>

                <div className="hidden md:flex gap-8 items-center">
                    <NavIcon icon={<Brain size={24} />} label="Planner & Map" active={activeTab === 'map'} onClick={() => setActiveTab('map')} dataTour="nav-map" dataTab="map" />
                    <NavIcon icon={<Search size={24} />} label="Content Finder" active={activeTab === 'content'} onClick={() => setActiveTab('content')} dataTour="nav-content" />
                    <NavIcon icon={<BarChart3 size={24} />} label="Progress" active={activeTab === 'progress'} onClick={() => setActiveTab('progress')} dataTour="nav-progress" />
                    <NavIcon icon={<Zap size={24} />} label="Brainstorm" active={activeTab === 'rag-test'} onClick={() => setActiveTab('rag-test')} dataTour="nav-brainstorm" dataTab="rag-test" />
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <div className={`hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border ${
                        backendStatus === 'online'
                            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                            : backendStatus === 'offline'
                                ? 'bg-red-500/10 text-red-300 border-red-500/30'
                                : 'bg-slate-500/10 text-slate-300 border-slate-500/30'
                    }`}>
                        <Server size={14} />
                        {backendStatus === 'online' ? 'Backend Online' : backendStatus === 'offline' ? 'Backend Offline' : 'Checking...'}
                    </div>
                    <span className="hidden lg:inline text-sm text-slate-400">{user?.email}</span>
                    <button
                        onClick={() => setQuickActionsOpen(true)}
                        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 transition-colors text-sm"
                        title="Quick Actions (Ctrl/Cmd + K)"
                    >
                        <Command size={14} />
                        Quick Actions
                    </button>
                    <button
                        onClick={() => {
                            setShowWelcome(false);
                            setShowTour(true);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-colors text-sm"
                        title="Restart Tour"
                    >
                        Tour
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        title="Logout"
                    >
                        <LogOut size={18} />
                        <span className="text-sm">Logout</span>
                    </button>
                </div>
            </nav>

            <main className="flex-1 pt-20 relative h-screen overflow-hidden flex flex-col z-10">
                {activeTab === 'map' && (
                    <div className="flex flex-1 overflow-hidden">
                        <GraphView onNodeClick={handleNodeClick} />
                        <HeadlineSidebar />
                        {selectedNode && <SetDetailView node={selectedNode} onClose={() => setSelectedNode(null)} />}
                    </div>
                )}
                {activeTab === 'content' && <ContentFinder />}
                {activeTab === 'progress' && <ProgressView />}
                {activeTab === 'rag-test' && (
                    <div className="w-full h-full">
                        <RAGTestUI />
                    </div>
                )}
            </main>

            {showWelcome && <WelcomeModal user={user} onStartTour={handleStartTour} onSkip={handleWelcomeSkip} />}
            {showTour && <Tour onComplete={handleTourComplete} onSkip={handleTourSkip} />}
            {quickActionsOpen && (
                <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
                    <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                            <div className="text-sm text-slate-300">Quick Actions</div>
                            <button
                                onClick={() => setQuickActionsOpen(false)}
                                className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700"
                                aria-label="Close quick actions"
                            >
                                <X size={14} />
                            </button>
                        </div>
                        <div className="p-2">
                            {quickActions.map((action) => (
                                <button
                                    key={action.id}
                                    onClick={() => {
                                        action.run();
                                        setQuickActionsOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors"
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                        <div className="px-4 py-2 text-xs text-slate-500 border-t border-slate-800">
                            Tip: Press Ctrl/Cmd + K to open, Esc to close.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function NavIcon({ icon, label, active, onClick, dataTour, dataTab }) {
    return (
        <button
            onClick={onClick}
            data-tour={dataTour}
            data-tab={dataTab}
            className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-emerald-300' : 'text-slate-400 hover:text-slate-200'}`}
        >
            {icon}
            <span className="text-xs font-medium">{label}</span>
        </button>
    );
}

export default App;
