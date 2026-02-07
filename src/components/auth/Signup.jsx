import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BadgeCheck, Lock, Mail, ShieldCheck, Sparkles, UserCircle2 } from 'lucide-react';
import { authAPI } from '../../services/api';

const Signup = ({ onNavigate }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        otp: '',
        terms: false
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setInterval(() => setCooldown((v) => v - 1), 1000);
        return () => clearInterval(t);
    }, [cooldown]);

    const validatePassword = (password) => {
        return (
            password.length >= 8 &&
            /[a-z]/.test(password) &&
            /[A-Z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[!@#$%^&*(),.?":{}|<>]/.test(password)
        );
    };

    const passwordChecks = useMemo(() => {
        const p = formData.password;
        return [
            { ok: p.length >= 8, label: '8+ characters' },
            { ok: /[A-Z]/.test(p), label: 'Uppercase letter' },
            { ok: /[a-z]/.test(p), label: 'Lowercase letter' },
            { ok: /[0-9]/.test(p), label: 'Number' },
            { ok: /[!@#$%^&*(),.?":{}|<>]/.test(p), label: 'Special character' }
        ];
    }, [formData.password]);

    const strength = passwordChecks.filter((c) => c.ok).length;

    const handleSendOtp = async () => {
        setMessage({ text: '', type: '' });
        if (!formData.email) {
            setMessage({ text: 'Enter your email first', type: 'error' });
            return;
        }

        if (cooldown > 0) return;

        try {
            setLoading(true);
            const res = await authAPI.sendSignupOtp(formData.email);
            setOtpSent(true);
            setCooldown(30);
            setMessage({ text: res.data.message || 'OTP sent to your email', type: 'success' });
        } catch (error) {
            setMessage({ text: error.response?.data?.error || 'Failed to send OTP', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword || !formData.otp) {
            setMessage({ text: 'Please fill in all required fields', type: 'error' });
            return;
        }

        if (!validatePassword(formData.password)) {
            setMessage({ text: 'Password must meet all security requirements', type: 'error' });
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setMessage({ text: 'Passwords do not match', type: 'error' });
            return;
        }

        if (!formData.terms) {
            setMessage({ text: 'Please accept Terms and Privacy Policy', type: 'error' });
            return;
        }

        try {
            setLoading(true);
            await authAPI.signup({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                otp: formData.otp
            });

            setMessage({ text: 'Account created successfully. Redirecting to login...', type: 'success' });
            setTimeout(() => onNavigate('login'), 1500);
        } catch (error) {
            setMessage({ text: error.response?.data?.error || 'Signup failed', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const messageClass = message.type === 'error'
        ? 'text-red-300 bg-red-500/10 border-red-500/30'
        : 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30';

    return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 md:p-6">
            <div className="w-full max-w-6xl grid lg:grid-cols-2 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900/70 backdrop-blur-xl">
                <section className="relative p-8 md:p-12 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border-b lg:border-b-0 lg:border-r border-slate-800">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-20 left-8 w-56 h-56 rounded-full bg-cyan-400/20 blur-3xl" />
                        <div className="absolute -bottom-20 right-0 w-72 h-72 rounded-full bg-purple-500/20 blur-3xl" />
                    </div>

                    <div className="relative">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs uppercase tracking-wide mb-5">
                            <Sparkles size={14} /> Buildathon Mode
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold leading-tight">Create Your EduPlan Account</h1>
                        <p className="mt-3 text-slate-300 max-w-md">
                            Verified onboarding with OTP so your study graph, docs, and progress stay secure from day one.
                        </p>

                        <div className="mt-8 grid gap-3 max-w-md">
                            <FeatureRow icon={<ShieldCheck size={16} />} text="OTP verification via Gmail SMTP" />
                            <FeatureRow icon={<BadgeCheck size={16} />} text="Strong password policy enforcement" />
                            <FeatureRow icon={<Sparkles size={16} />} text="Ready for hackathon demo and judging" />
                        </div>
                    </div>
                </section>

                <section className="p-8 md:p-10 lg:p-12">
                    <h2 className="text-2xl font-semibold mb-1">Sign Up</h2>
                    <p className="text-sm text-slate-400 mb-7">Create an account and verify with OTP.</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Label text="Full Name" />
                        <InputWithIcon icon={<UserCircle2 size={16} className="text-slate-500" />}>
                            <input
                                type="text"
                                placeholder="Your full name"
                                value={formData.fullName}
                                onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-indigo-500 focus:outline-none"
                                required
                            />
                        </InputWithIcon>

                        <Label text="Email + OTP" />
                        <div className="flex flex-col sm:flex-row gap-2">
                            <InputWithIcon icon={<Mail size={16} className="text-slate-500" />} className="flex-1">
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-indigo-500 focus:outline-none"
                                    required
                                />
                            </InputWithIcon>
                            <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={loading || cooldown > 0}
                                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium"
                            >
                                {cooldown > 0 ? `Resend ${cooldown}s` : otpSent ? 'Resend OTP' : 'Send OTP'}
                            </button>
                        </div>

                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                            value={formData.otp}
                            onChange={(e) => setFormData((p) => ({ ...p, otp: e.target.value.replace(/\D/g, '') }))}
                            className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-indigo-500 focus:outline-none"
                            required
                        />

                        <Label text="Password" />
                        <InputWithIcon icon={<Lock size={16} className="text-slate-500" />}>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Create a strong password"
                                value={formData.password}
                                onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                                className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-indigo-500 focus:outline-none"
                                required
                            />
                            <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-200">
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </InputWithIcon>

                        <div className="space-y-2">
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all ${strength <= 2 ? 'bg-red-500' : strength === 3 ? 'bg-yellow-500' : strength === 4 ? 'bg-sky-500' : 'bg-emerald-500'}`}
                                    style={{ width: `${(strength / 5) * 100}%` }}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-xs text-slate-400">
                                {passwordChecks.map((c) => (
                                    <div key={c.label} className={c.ok ? 'text-emerald-300' : 'text-slate-500'}>
                                        {c.ok ? 'OK' : '•'} {c.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Label text="Confirm Password" />
                        <InputWithIcon icon={<Lock size={16} className="text-slate-500" />}>
                            <input
                                type={showConfirm ? 'text' : 'password'}
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))}
                                className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-indigo-500 focus:outline-none"
                                required
                            />
                            <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-200">
                                {showConfirm ? 'Hide' : 'Show'}
                            </button>
                        </InputWithIcon>

                        <label className="flex items-start gap-2 text-xs text-slate-300">
                            <input
                                type="checkbox"
                                checked={formData.terms}
                                onChange={(e) => setFormData((p) => ({ ...p, terms: e.target.checked }))}
                                className="mt-0.5"
                            />
                            I agree to Terms and Privacy Policy.
                        </label>

                        {message.text && <div className={`border rounded-lg px-3 py-2 text-sm ${messageClass}`}>{message.text}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 disabled:opacity-60 font-semibold flex items-center justify-center gap-2"
                        >
                            {loading ? 'Please wait...' : 'Create Account'}
                            {!loading && <ArrowRight size={16} />}
                        </button>

                        <p className="text-sm text-slate-400 text-center">
                            Already have an account?{' '}
                            <button type="button" onClick={() => onNavigate('login')} className="text-indigo-300 hover:text-indigo-200 font-medium">
                                Log In
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
            <div className="p-1.5 rounded-md bg-slate-800 border border-slate-700 text-indigo-300">{icon}</div>
            <span>{text}</span>
        </div>
    );
}

function Label({ text }) {
    return <label className="text-sm text-slate-300">{text}</label>;
}

function InputWithIcon({ icon, children, className = '' }) {
    return <div className={`relative ${className}`}>{icon && <span className="absolute left-3 top-3">{icon}</span>}{children}</div>;
}

export default Signup;
