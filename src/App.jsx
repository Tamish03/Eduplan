import React, { useState, useEffect, useMemo } from 'react';
import { Brain, Search, BarChart3, Zap, LogOut, Command, Server, X } from 'lucide-react';
import GraphView from './components/GraphView';
import SetDetailView from './components/SetDetailView';
import HeadlineSidebar from './components/HeadlineSidebar';
import ProgressView from './components/ProgressView';
import ContentFinder from './components/ContentFinder';
import RAGTestUI from './components/RAGTestUI';
import AuthContainer from './components/auth/AuthContainer';
import LandingPage from './components/LandingPage';
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
    const [showLoginPage, setShowLoginPage] = useState(false);

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
        setShowLoginPage(false);
    };

    const handleNavigateToLogin = () => {
        setShowLoginPage(true);
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
        setShowLoginPage(false);
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
        if (showLoginPage) {
            return <AuthContainer onLogin={handleLogin} />;
        }
        return <LandingPage onNavigateToLogin={handleNavigateToLogin} onGuestLogin={handleLogin} />;
    }

    return (
        <div className="min-h-screen text-white flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF8DA1] via-white to-[#AD56C4] opacity-90" />
                <div className="absolute -top-20 -left-16 w-64 h-64 rounded-full bg-[#FF8DA1]/10 blur-3xl" />
                <div className="absolute -top-24 right-0 w-72 h-72 rounded-full bg-[#AD56C4]/10 blur-3xl" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[36rem] h-48 rounded-full bg-[#FF9CE9]/10 blur-3xl" />
            </div>

            <nav className="h-20 border-b border-slate-800 flex items-center justify-between px-4 md:px-6 bg-slate-900/65 backdrop-blur-md fixed w-full z-50">
                <div className="min-w-[210px]">
                    <div className="text-xl font-bold bg-gradient-to-r from-[#FF8DA1] via-slate-100 to-[#AD56C4] bg-clip-text text-transparent">
                        EduPlan.ai
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.16em] text-slate-400 whitespace-nowrap">
                        <span>Learn</span>
                        <span className="mx-1.5 text-[#FF8DA1]">•</span>
                        <span>Connect</span>
                        <span className="mx-1.5 text-white">•</span>
                        <span>Build</span>
                    </div>
                </div>

                <div className="hidden md:flex gap-2 items-center">
                    <NavIcon icon={<Brain size={20} />} label="Learning Path" active={activeTab === 'map'} onClick={() => setActiveTab('map')} dataTour="nav-map" dataTab="map" />
                    <NavIcon icon={<Search size={20} />} label="Discover" active={activeTab === 'content'} onClick={() => setActiveTab('content')} dataTour="nav-content" />
                    <NavIcon icon={<BarChart3 size={20} />} label="Analytics" active={activeTab === 'progress'} onClick={() => setActiveTab('progress')} dataTour="nav-progress" />
                    <NavIcon icon={<Zap size={20} />} label="AI Studio" active={activeTab === 'rag-test'} onClick={() => setActiveTab('rag-test')} dataTour="nav-brainstorm" dataTab="rag-test" />
                </div>

                <div className="flex items-center gap-2 md:gap-4">
                    <div className={`hidden lg:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border ${
                        backendStatus === 'online'
                            ? 'bg-[#AD56C4]/10 text-[#AD56C4] border-[#AD56C4]/30'
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
                        className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF8DA1]/10 to-[#AD56C4]/10 border border-[#FF8DA1]/20 text-[#FF9CE9] hover:from-[#FF8DA1]/20 hover:to-[#AD56C4]/20 transition-all text-sm font-medium backdrop-blur-xl"
                        title="Quick Actions (Ctrl/Cmd + K)"
                    >
                        <Command size={16} />
                        <span>Quick Actions</span>
                    </button>
                    <button
                        onClick={() => {
                            setShowWelcome(false);
                            setShowTour(true);
                        }}
                        className="relative group"
                        title="Restart Tour"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#FF8DA1] to-[#AD56C4] rounded-xl blur-md group-hover:blur-lg transition-all opacity-0 group-hover:opacity-50" />
                        <div className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF8DA1] to-[#AD56C4] font-medium text-sm text-white group-hover:scale-105 transition-transform">
                            ✨ Tour
                        </div>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-red-500/50 text-slate-300 hover:text-red-400 transition-all font-medium"
                        title="Logout"
                    >
                        <LogOut size={16} />
                        <span className="text-sm">Logout</span>
                    </button>
                </div>
            </nav>

            <main className="flex-1 pt-20 pb-20 md:pb-0 relative h-screen overflow-hidden flex flex-col z-10">
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

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-white/10 px-4 py-3 z-50">
                <div className="flex items-center justify-around">
                    <button
                        onClick={() => setActiveTab('map')}
                        className={`flex flex-col items-center gap-1 transition-all ${
                            activeTab === 'map' ? 'text-[#FF9CE9]' : 'text-slate-400'
                        }`}
                    >
                        <div className={`p-2 rounded-xl transition-all ${
                            activeTab === 'map' 
                                ? 'bg-gradient-to-r from-[#FF8DA1]/20 to-[#AD56C4]/20 border border-[#FF8DA1]/30 scale-110' 
                                : ''
                        }`}>
                            <Brain size={22} />
                        </div>
                        <span className="text-[10px] font-medium">Path</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('content')}
                        className={`flex flex-col items-center gap-1 transition-all ${
                            activeTab === 'content' ? 'text-[#FF9CE9]' : 'text-slate-400'
                        }`}
                    >
                        <div className={`p-2 rounded-xl transition-all ${
                            activeTab === 'content' 
                                ? 'bg-gradient-to-r from-[#FF8DA1]/20 to-[#AD56C4]/20 border border-[#FF8DA1]/30 scale-110' 
                                : ''
                        }`}>
                            <Search size={22} />
                        </div>
                        <span className="text-[10px] font-medium">Discover</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('progress')}
                        className={`flex flex-col items-center gap-1 transition-all ${
                            activeTab === 'progress' ? 'text-[#FF9CE9]' : 'text-slate-400'
                        }`}
                    >
                        <div className={`p-2 rounded-xl transition-all ${
                            activeTab === 'progress' 
                                ? 'bg-gradient-to-r from-[#FF8DA1]/20 to-[#AD56C4]/20 border border-[#FF8DA1]/30 scale-110' 
                                : ''
                        }`}>
                            <BarChart3 size={22} />
                        </div>
                        <span className="text-[10px] font-medium">Analytics</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('rag-test')}
                        className={`flex flex-col items-center gap-1 transition-all ${
                            activeTab === 'rag-test' ? 'text-[#FF9CE9]' : 'text-slate-400'
                        }`}
                    >
                        <div className={`p-2 rounded-xl transition-all ${
                            activeTab === 'rag-test' 
                                ? 'bg-gradient-to-r from-[#FF8DA1]/20 to-[#AD56C4]/20 border border-[#FF8DA1]/30 scale-110' 
                                : ''
                        }`}>
                            <Zap size={22} />
                        </div>
                        <span className="text-[10px] font-medium">AI Studio</span>
                    </button>
                </div>
            </div>

            {showWelcome && <WelcomeModal user={user} onStartTour={handleStartTour} onSkip={handleWelcomeSkip} />}
            {showTour && <Tour onComplete={handleTourComplete} onSkip={handleTourSkip} />}
            {quickActionsOpen && (
                <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-md flex items-start justify-center pt-24 px-4 animate-fade-in">
                    <div className="w-full max-w-xl relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#FF8DA1]/20 to-[#AD56C4]/20 rounded-3xl blur-xl" />
                        <div className="relative bg-slate-900/90 border border-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl">
                            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#FF8DA1] to-[#AD56C4] animate-pulse" />
                                    <div className="font-semibold bg-gradient-to-r from-[#FF8DA1] to-[#AD56C4] bg-clip-text text-transparent">Quick Actions</div>
                                </div>
                                <button
                                    onClick={() => setQuickActionsOpen(false)}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
                                    aria-label="Close quick actions"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="p-3">
                                {quickActions.map((action, index) => (
                                    <button
                                        key={action.id}
                                        onClick={() => {
                                            action.run();
                                            setQuickActionsOpen(false);
                                        }}
                                        className="w-full text-left px-4 py-3.5 rounded-xl hover:bg-gradient-to-r hover:from-[#FF8DA1]/10 hover:to-[#AD56C4]/10 border border-transparent hover:border-[#FF8DA1]/20 text-slate-200 hover:text-white transition-all mb-2 group"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF8DA1]/20 to-[#AD56C4]/20 flex items-center justify-center text-[#FF9CE9] group-hover:scale-110 transition-transform">
                                                {index === 0 && '🗺️'}
                                                {index === 1 && '🔍'}
                                                {index === 2 && '📊'}
                                                {index === 3 && '⚡'}
                                                {index === 4 && '✨'}
                                            </div>
                                            <span className="font-medium">{action.label}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className="px-6 py-3 text-xs text-slate-500 border-t border-white/10 bg-white/5">
                                <div className="flex items-center gap-2">
                                    <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-[10px]">Ctrl</kbd>
                                    <span>+</span>
                                    <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-[10px]">K</kbd>
                                    <span className="mx-2">to open •</span>
                                    <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 font-mono text-[10px]">Esc</kbd>
                                    <span>to close</span>
                                </div>
                            </div>
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
            className="group relative"
        >
            {active && (
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF8DA1]/20 to-[#AD56C4]/20 rounded-2xl blur-lg" />
            )}
            <div className={`relative flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all ${
                active 
                    ? 'bg-gradient-to-r from-[#FF8DA1]/10 to-[#AD56C4]/10 border border-[#FF8DA1]/30 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
            }`}>
                <div className={`transition-transform ${
                    active ? 'scale-110' : 'group-hover:scale-105'
                }`}>
                    {icon}
                </div>
                <span className="text-sm font-medium">{label}</span>
            </div>
        </button>
    );
}

export default App;
