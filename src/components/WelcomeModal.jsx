import React from 'react';
import { Sparkles, X } from 'lucide-react';

const WelcomeModal = ({ user, onStartTour, onSkip }) => {
    return (
        <div className="fixed inset-0 bg-black/80 z-[10001] flex items-center justify-center p-4 backdrop-blur-md">
            <div className="relative max-w-lg w-full">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF8DA1]/20 to-[#AD56C4]/20 rounded-3xl blur-2xl" />
                
                {/* Main card */}
                <div className="relative bg-slate-900/95 border border-white/10 rounded-3xl shadow-2xl p-8 overflow-hidden backdrop-blur-xl">
                    {/* Animated background effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#FF8DA1]/10 via-[#FF9CE9]/10 to-[#AD56C4]/10 animate-gradient" />
                    
                    {/* Content */}
                    <div className="relative z-10">
                        <button
                            onClick={onSkip}
                            className="absolute top-0 right-0 text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-xl"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex justify-center mb-6">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-[#FF8DA1] to-[#AD56C4] rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                                <div className="relative w-20 h-20 bg-gradient-to-br from-[#FF8DA1] to-[#AD56C4] rounded-full flex items-center justify-center animate-float">
                                    <Sparkles size={36} className="text-white" />
                                </div>
                            </div>
                        </div>

                        <h2 className="text-3xl font-bold text-center mb-3 bg-gradient-to-r from-[#FF8DA1] via-[#FF9CE9] to-[#AD56C4] bg-clip-text text-transparent">
                            Welcome to EduPlan.ai!
                        </h2>
                        
                        <p className="text-slate-200 text-center mb-2 text-lg font-medium">
                            Hey {user?.name || user?.email?.split('@')[0] || 'there'}! 👋
                        </p>

                        <p className="text-slate-400 text-center mb-8 leading-relaxed">
                            We're excited to help you on your learning journey. Would you like a quick tour of the key features to get started?
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={onStartTour}
                                className="relative w-full py-3.5 font-semibold rounded-xl transition-all group overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#FF8DA1] to-[#AD56C4] opacity-100 group-hover:opacity-90 transition-opacity" />
                                <div className="absolute inset-0 bg-gradient-to-r from-[#FF8DA1] to-[#AD56C4] blur-xl opacity-0 group-hover:opacity-50 transition-opacity" />
                                <div className="relative flex items-center justify-center gap-2 text-white">
                                    <Sparkles size={20} />
                                    Start Tour (2 minutes)
                                </div>
                            </button>
                            
                            <button
                                onClick={onSkip}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-medium rounded-xl transition-all"
                            >
                                Skip - I'll explore on my own
                            </button>
                        </div>

                        <p className="text-xs text-slate-500 text-center mt-4 flex items-center justify-center gap-2">
                            <span>💡</span>
                            <span>You can restart the tour anytime from the "✨ Tour" button in the navbar</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;
