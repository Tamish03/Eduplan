import React, { useState, useEffect } from 'react';
import { Brain, Zap, BarChart3, Search, ArrowRight, CheckCircle, Sparkles, TrendingUp, Users, Shield, Lightbulb, Target, Trophy, ChevronRight } from 'lucide-react';

function LandingPage({ onNavigateToLogin, onGuestLogin }) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Animated gradient orbs */}
                <div 
                    className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#FF8DA1]/30 blur-[150px] animate-pulse"
                    style={{
                        transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
                    }}
                />
                <div 
                    className="absolute top-1/3 right-1/4 w-[600px] h-[600px] rounded-full bg-[#FF9CE9]/30 blur-[150px] animate-pulse"
                    style={{
                        animationDelay: '1s',
                        transform: `translate(${-mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
                    }}
                />
                <div 
                    className="absolute bottom-0 left-1/2 w-[700px] h-[700px] rounded-full bg-[#AD56C4]/20 blur-[150px] animate-pulse"
                    style={{
                        animationDelay: '2s',
                        transform: `translate(${mousePosition.x * 0.01}px, ${-mousePosition.y * 0.01}px)`
                    }}
                />
                
                {/* Animated grid */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,141,161,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,156,233,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
                </div>
                
                {/* Floating particles */}
                <div className="absolute inset-0">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-gradient-to-r from-[#FF8DA1] to-[#AD56C4] rounded-full animate-float"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: `${5 + Math.random() * 10}s`
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Navigation */}
            <nav className="relative z-50 border-b border-white/5 bg-black/50 backdrop-blur-2xl sticky top-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-3 group cursor-pointer">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-[#FF8DA1] to-[#AD56C4] rounded-xl blur-md group-hover:blur-lg transition-all" />
                                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF8DA1] to-[#AD56C4] flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Brain className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <div className="text-2xl font-bold">
                                <span className="bg-gradient-to-r from-[#FF8DA1] via-[#FF9CE9] to-[#AD56C4] bg-clip-text text-transparent">
                                    EduPlan.ai
                                </span>
                            </div>
                        </div>
                        
                        <div className="hidden md:flex items-center gap-8">
                            <NavLink label="Features" target="features" />
                            <NavLink label="How it Works" target="how-it-works" />
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onNavigateToLogin}
                                className="hidden sm:block px-5 py-2.5 rounded-xl text-white/80 hover:text-white transition-colors font-medium"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={onNavigateToLogin}
                                className="relative group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#FF8DA1] to-[#AD56C4] rounded-xl blur-md group-hover:blur-lg transition-all opacity-75 group-hover:opacity-100" />
                                <div className="relative px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF8DA1] to-[#AD56C4] font-semibold group-hover:scale-105 transition-transform">
                                    Get Started
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-32 pb-20">
                <div className="text-center max-w-6xl mx-auto">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#FF8DA1]/10 to-[#AD56C4]/10 border border-[#FF8DA1]/20 backdrop-blur-xl mb-8 group hover:scale-105 transition-transform cursor-pointer">
                        <Sparkles className="w-4 h-4 text-[#FF8DA1] animate-pulse" />
                        <span className="text-sm font-medium bg-gradient-to-r from-[#FF8DA1] to-[#AD56C4] bg-clip-text text-transparent">
                            Next-Gen AI Learning Platform
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#AD56C4] group-hover:translate-x-1 transition-transform" />
                    </div>
                    
                    {/* Main Headline */}
                    <h1 className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black mb-8 leading-[1.1] tracking-tight">
                        <span className="inline-block bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent animate-fade-in">
                            Transform
                        </span>
                        <br />
                        <span className="inline-block bg-gradient-to-r from-[#FF8DA1] via-[#FF9CE9] to-[#AD56C4] bg-clip-text text-transparent animate-gradient">
                            Your Learning
                        </span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
                        Harness the power of AI to create personalized learning paths, discover curated content, and track your progress with intelligent analytics.
                    </p>
                    
                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                        <button
                            onClick={onNavigateToLogin}
                            className="group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-[#FF8DA1] to-[#AD56C4] rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-75 group-hover:opacity-100" />
                            <div className="relative px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF8DA1] to-[#AD56C4] font-bold text-lg flex items-center gap-2 group-hover:scale-105 transition-transform">
                                Start for Free
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>
                        <button
                            onClick={() => onGuestLogin({ email: 'guest@eduplan.ai', name: 'Guest User' })}
                            className="group px-8 py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all font-bold text-lg backdrop-blur-xl"
                        >
                            Watch Demo
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        <FloatingStatCard number="3D" label="Knowledge Graph" delay="0s" />
                        <FloatingStatCard number="RAG" label="Technology" delay="0.1s" />
                        <FloatingStatCard number="100%" label="Free to Use" delay="0.2s" />
                        <FloatingStatCard number="AI" label="Powered" delay="0.3s" />
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#FF8DA1]/10 to-[#AD56C4]/10 border border-[#FF8DA1]/20 backdrop-blur-xl mb-6">
                        <Zap className="w-4 h-4 text-[#FF8DA1]" />
                        <span className="text-sm font-medium text-[#FF8DA1]">Features</span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black mb-6">
                        <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Supercharge Your
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-[#FF8DA1] to-[#AD56C4] bg-clip-text text-transparent">
                            Learning Experience
                        </span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Powerful AI-driven tools to help you learn smarter, not harder
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <ModernFeatureCard
                        icon={<Brain className="w-8 h-8" />}
                        title="3D Knowledge Graph"
                        description="Visualize your learning path as an interactive 3D graph with connected study sets and topics"
                        color="pink"
                    />
                    <ModernFeatureCard
                        icon={<Search className="w-8 h-8" />}
                        title="AI Content Discovery"
                        description="Find curated resources from Khan Academy, Coursera, YouTube, and more with intelligent recommendations"
                        color="magenta"
                    />
                    <ModernFeatureCard
                        icon={<BarChart3 className="w-8 h-8" />}
                        title="Progress Analytics"
                        description="Track your learning with AI-powered gap analysis and personalized improvement suggestions"
                        color="purple"
                    />
                    <ModernFeatureCard
                        icon={<Zap className="w-8 h-8" />}
                        title="AI Studio (RAG)"
                        description="Upload documents, ask questions, and get intelligent answers using advanced RAG technology"
                        color="pink"
                    />
                    <ModernFeatureCard
                        icon={<Sparkles className="w-8 h-8" />}
                        title="Study Set Creation"
                        description="Create and organize study sets with document uploads, AI processing, and smart categorization"
                        color="magenta"
                    />
                    <ModernFeatureCard
                        icon={<Shield className="w-8 h-8" />}
                        title="Secure Authentication"
                        description="OTP-verified signup with Gmail SMTP integration for robust account security"
                        color="purple"
                    />
                </div>
            </div>

            {/* How it Works */}
            <div id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#FF8DA1]/10 to-[#AD56C4]/10 border border-[#FF8DA1]/20 backdrop-blur-xl mb-6">
                        <Lightbulb className="w-4 h-4 text-[#FF8DA1]" />
                        <span className="text-sm font-medium text-[#FF8DA1]">How It Works</span>
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black mb-6">
                        <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Complete Learning
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-[#FF8DA1] to-[#AD56C4] bg-clip-text text-transparent">
                            Workflow Guide
                        </span>
                    </h2>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                        From signup to mastery - here's your complete journey with EduPlan.ai
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StepCard
                        number="01"
                        icon={<Shield className="w-12 h-12" />}
                        title="Secure Signup"
                        description="Create your account with OTP verification via email. Strong password policy ensures your data stays protected."
                    />
                    <StepCard
                        number="02"
                        icon={<Zap className="w-12 h-12" />}
                        title="Create Study Sets"
                        description="Upload documents (PDF, DOC) in the AI Studio. Our RAG system processes and analyzes your materials automatically."
                    />
                    <StepCard
                        number="03"
                        icon={<Brain className="w-12 h-12" />}
                        title="Visualize Knowledge"
                        description="View your study sets as an interactive 3D knowledge graph. See connections between topics and navigate visually."
                    />
                    <StepCard
                        number="04"
                        icon={<Search className="w-12 h-12" />}
                        title="Discover Resources"
                        description="Use Content Finder to search for educational materials. AI curates resources from Khan Academy, Coursera, YouTube & more."
                    />
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StepCard
                        number="05"
                        icon={<Target className="w-12 h-12" />}
                        title="Ask Questions"
                        description="Interact with your uploaded documents using the AI chatbot. Get instant answers based on your study materials."
                    />
                    <StepCard
                        number="06"
                        icon={<BarChart3 className="w-12 h-12" />}
                        title="Track Progress"
                        description="Monitor your learning with real-time analytics. AI identifies knowledge gaps and provides personalized recommendations."
                    />
                    <StepCard
                        number="07"
                        icon={<Trophy className="w-12 h-12" />}
                        title="Achieve Goals"
                        description="Complete your learning objectives with data-driven insights. Celebrate milestones and continue growing."
                    />
                </div>
            </div>

            {/* CTA Section */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
                <div className="relative">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FF8DA1]/20 to-[#AD56C4]/20 rounded-3xl blur-3xl" />
                    
                    <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-2xl p-12 md:p-20">
                        <div className="absolute inset-0">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#FF8DA1]/10 via-transparent to-[#AD56C4]/10" />
                            <div className="absolute top-0 left-1/4 w-64 h-64 bg-[#FF8DA1]/20 rounded-full blur-3xl animate-pulse" />
                            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#AD56C4]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                        </div>
                        
                        <div className="relative text-center">
                            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6">
                                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                    Ready to
                                </span>
                                <br />
                                <span className="bg-gradient-to-r from-[#FF8DA1] via-[#FF9CE9] to-[#AD56C4] bg-clip-text text-transparent animate-gradient">
                                    Transform?
                                </span>
                            </h2>
                            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto">
                                Start your AI-powered learning journey today
                            </p>
                            
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button
                                    onClick={onNavigateToLogin}
                                    className="group relative"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#FF8DA1] to-[#AD56C4] rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                                    <div className="relative px-10 py-5 rounded-2xl bg-gradient-to-r from-[#FF8DA1] to-[#AD56C4] font-bold text-xl flex items-center gap-2 group-hover:scale-105 transition-transform">
                                        Get Started Free
                                        <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </button>
                            </div>
                            
                            <p className="mt-6 text-sm text-gray-500">No credit card required • Free forever</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 bg-black/50 backdrop-blur-2xl mt-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#FF8DA1] to-[#AD56C4] rounded-xl blur-md" />
                                    <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#FF8DA1] to-[#AD56C4] flex items-center justify-center">
                                        <Brain className="w-7 h-7 text-white" />
                                    </div>
                                </div>
                                <div className="text-2xl font-bold bg-gradient-to-r from-[#FF8DA1] to-[#AD56C4] bg-clip-text text-transparent">
                                    EduPlan.ai
                                </div>
                            </div>
                            <p className="text-gray-400 max-w-md mb-6">
                                Empowering learners worldwide with AI-driven education. Transform your learning journey today.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="font-bold mb-4 text-white">Product</h3>
                            <ul className="space-y-3 text-gray-400">
                                <li>
                                    <button 
                                        onClick={() => {
                                            const element = document.getElementById('features');
                                            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }} 
                                        className="hover:text-[#FF8DA1] transition-colors"
                                    >
                                        Features
                                    </button>
                                </li>
                                <li>
                                    <button 
                                        onClick={() => {
                                            const element = document.getElementById('how-it-works');
                                            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }} 
                                        className="hover:text-[#FF8DA1] transition-colors"
                                    >
                                        How it Works
                                    </button>
                                </li>
                                <li>
                                    <button 
                                        onClick={() => onGuestLogin({ email: 'guest@eduplan.ai', name: 'Guest User' })} 
                                        className="hover:text-[#FF8DA1] transition-colors"
                                    >
                                        Try Demo
                                    </button>
                                </li>
                            </ul>
                        </div>
                        
                        <div>
                            <h3 className="font-bold mb-4 text-white">Quick Links</h3>
                            <ul className="space-y-3 text-gray-400">
                                <li>
                                    <button 
                                        onClick={onNavigateToLogin} 
                                        className="hover:text-[#FF8DA1] transition-colors"
                                    >
                                        Sign In
                                    </button>
                                </li>
                                <li>
                                    <button 
                                        onClick={onNavigateToLogin} 
                                        className="hover:text-[#FF8DA1] transition-colors"
                                    >
                                        Create Account
                                    </button>
                                </li>
                                <li>
                                    <a 
                                        href="https://github.com" 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="hover:text-[#FF8DA1] transition-colors"
                                    >
                                        GitHub
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className="pt-8 border-t border-white/5 text-center">
                        <p className="text-gray-500 text-sm">
                            © 2026 EduPlan.ai. Built with ❤️ for learners everywhere.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

// Component Functions
function NavLink({ label, target }) {
    const handleClick = () => {
        if (target) {
            const element = document.getElementById(target);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    return (
        <button 
            onClick={handleClick}
            className="text-gray-400 hover:text-white transition-colors font-medium"
        >
            {label}
        </button>
    );
}

function FloatingStatCard({ number, label, delay }) {
    return (
        <div 
            className="group relative animate-float-slow"
            style={{ animationDelay: delay }}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF8DA1]/20 to-[#AD56C4]/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-2xl group-hover:border-white/20 transition-all">
                <div className="text-4xl font-black bg-gradient-to-r from-[#FF8DA1] to-[#AD56C4] bg-clip-text text-transparent mb-2">
                    {number}
                </div>
                <div className="text-sm text-gray-400 font-medium">{label}</div>
            </div>
        </div>
    );
}

function ModernFeatureCard({ icon, title, description, color }) {
    const colorClasses = {
        pink: 'from-[#FF8DA1]/20 to-[#FF8DA1]/5 border-[#FF8DA1]/20 text-[#FF8DA1]',
        magenta: 'from-[#FF9CE9]/20 to-[#FF9CE9]/5 border-[#FF9CE9]/20 text-[#FF9CE9]',
        purple: 'from-[#AD56C4]/20 to-[#AD56C4]/5 border-[#AD56C4]/20 text-[#AD56C4]',
    };

    return (
        <div className="group relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]} rounded-3xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100`} />
            <div className={`relative h-full bg-black/40 border ${colorClasses[color].split(' ')[2]} hover:border-opacity-40 rounded-3xl p-8 backdrop-blur-2xl transition-all group-hover:-translate-y-2`}>
                <div className={`${colorClasses[color].split(' ')[3]} mb-6 transform group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">{title}</h3>
                <p className="text-gray-400 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

function StepCard({ number, icon, title, description }) {
    return (
        <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF8DA1]/10 to-[#AD56C4]/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100" />
            <div className="relative bg-black/40 border border-white/10 hover:border-white/20 rounded-3xl p-8 backdrop-blur-2xl transition-all group-hover:-translate-y-2">
                <div className="text-6xl font-black bg-gradient-to-r from-[#FF8DA1]/20 to-[#AD56C4]/20 bg-clip-text text-transparent mb-6">
                    {number}
                </div>
                <div className="text-[#FF8DA1] mb-6 transform group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">{title}</h3>
                <p className="text-gray-400 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}

export default LandingPage;
