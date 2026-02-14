import React, { useMemo, useState } from 'react';
import { ArrowRight, Brain, KeyRound, Lock, Mail, Sparkles } from 'lucide-react';
import { authAPI } from '../../services/api';

const Login = ({ onLogin, onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const messageClass = useMemo(
        () => (message.type === 'error' ? 'text-red-300 bg-red-500/10 border-red-500/30' : 'text-[#AD56C4] bg-[#AD56C4]/10 border-[#AD56C4]/30'),
        [message.type]
    );

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        try {
            setLoading(true);
            const res = await authAPI.login(email, password);
            const { user, token } = res.data;

            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('authToken', token || `token_${Date.now()}`);
            onLogin(user);
        } catch (error) {
            setMessage({ text: error.response?.data?.error || 'Login failed', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 md:p-6">
            <div className="w-full max-w-6xl grid lg:grid-cols-2 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900/70 backdrop-blur-xl">
                <section className="relative p-8 md:p-12 bg-gradient-to-br from-slate-900 via-slate-900 to-black border-b lg:border-b-0 lg:border-r border-slate-800">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-16 -left-16 w-52 h-52 rounded-full bg-[#FF8DA1]/20 blur-3xl" />
                        <div className="absolute -bottom-20 right-0 w-64 h-64 rounded-full bg-[#AD56C4]/20 blur-3xl" />
                    </div>

                    <div className="relative">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF8DA1]/10 border border-[#FF8DA1]/30 text-[#FF8DA1] text-xs uppercase tracking-wide mb-5">
                            <Sparkles size={14} /> AI-Powered Learning
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold leading-tight bg-gradient-to-r from-[#FF8DA1] via-[#FF9CE9] to-[#AD56C4] bg-clip-text text-transparent">
                            EduPlan.ai
                        </h1>
                        <p className="mt-3 text-slate-300 max-w-md">
                            Turn scattered study resources into a connected learning engine with RAG, planning, and progress intelligence.
                        </p>

                        <div className="mt-8 grid gap-3 max-w-md">
                            <FeatureRow icon={<Brain size={16} />} text="RAG-powered Q&A over your own documents" />
                            <FeatureRow icon={<KeyRound size={16} />} text="Secure OTP-based auth with Gmail SMTP" />
                            <FeatureRow icon={<Lock size={16} />} text="Hackathon-ready architecture and route stability" />
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={() => onLogin({ email: 'guest@eduplan.ai', name: 'Guest User' })}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF8DA1] to-[#AD56C4] hover:from-[#FF8DA1]/90 hover:to-[#AD56C4]/90 font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#FF8DA1]/20"
                            >
                                Continue as Guest User
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </section>

                <section className="p-8 md:p-10 lg:p-12">
                    <h2 className="text-2xl font-semibold mb-1">Welcome Back</h2>
                    <p className="text-sm text-slate-400 mb-7">Sign in to continue your learning workflow.</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <FieldLabel label="Email" />
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-3 text-slate-500" />
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-[#FF9CE9] focus:outline-none"
                                required
                            />
                        </div>

                        <FieldLabel label="Password" />
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-3 text-slate-500" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-[#FF9CE9] focus:outline-none"
                                required
                            />
                            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-200">
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>

                        <div className="flex justify-end">
                            <button type="button" onClick={() => onNavigate('forgot-password')} className="text-sm text-[#FF9CE9] hover:text-[#FF8DA1]">
                                Forgot Password?
                            </button>
                        </div>

                        {message.text && <div className={`border rounded-lg px-3 py-2 text-sm ${messageClass}`}>{message.text}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#FF8DA1] to-[#AD56C4] hover:from-[#FF8DA1]/90 hover:to-[#AD56C4]/90 disabled:opacity-60 font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#FF8DA1]/20"
                        >
                            {loading ? 'Signing in...' : 'Log In'}
                            {!loading && <ArrowRight size={16} />}
                        </button>

                        <p className="text-sm text-slate-400 text-center">
                            No account?{' '}
                            <button type="button" onClick={() => onNavigate('signup')} className="text-[#FF9CE9] hover:text-[#FF8DA1] font-medium">
                                Create one now
                            </button>
                        </p>
                    </form>
                </section>
            </div>
        </div>
    );
};

function FeatureRow({ icon, text }) {
    return (
        <div className="flex items-center gap-2.5 text-sm text-slate-200">
            <div className="p-1.5 rounded-md bg-slate-800 border border-slate-700 text-[#FF9CE9]">{icon}</div>
            <span>{text}</span>
        </div>
    );
}

function FieldLabel({ label }) {
    return <label className="text-sm text-slate-300">{label}</label>;
}

export default Login;
