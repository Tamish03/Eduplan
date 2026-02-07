import React, { useMemo, useState } from 'react';
import { ArrowRight, KeyRound, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { authAPI } from '../../services/api';

const ForgotPassword = ({ onNavigate }) => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const messageClass = useMemo(
        () => (message.type === 'error' ? 'text-red-300 bg-red-500/10 border-red-500/30' : 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30'),
        [message.type]
    );

    const validatePassword = (password) => {
        return (
            password.length >= 8 &&
            /[a-z]/.test(password) &&
            /[A-Z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[!@#$%^&*(),.?":{}|<>]/.test(password)
        );
    };

    const requestOtp = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        try {
            setLoading(true);
            const res = await authAPI.sendResetOtp(email);
            setMessage({ text: res.data.message || 'Reset OTP sent to your email', type: 'success' });
            setStep(2);
        } catch (error) {
            setMessage({ text: error.response?.data?.error || 'Failed to send OTP', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (newPassword !== confirmPassword) {
            setMessage({ text: 'Passwords do not match', type: 'error' });
            return;
        }

        if (!validatePassword(newPassword)) {
            setMessage({ text: 'Password is not strong enough', type: 'error' });
            return;
        }

        try {
            setLoading(true);
            await authAPI.resetPassword({ email, otp, newPassword });
            setMessage({ text: 'Password reset successful. Redirecting to login...', type: 'success' });
            setTimeout(() => onNavigate('login'), 1300);
        } catch (error) {
            setMessage({ text: error.response?.data?.error || 'Reset failed', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 md:p-6">
            <div className="w-full max-w-6xl grid lg:grid-cols-2 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900/70 backdrop-blur-xl">
                <section className="relative p-8 md:p-12 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 border-b lg:border-b-0 lg:border-r border-slate-800">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute -top-16 -left-14 w-56 h-56 rounded-full bg-cyan-400/15 blur-3xl" />
                        <div className="absolute -bottom-20 right-0 w-72 h-72 rounded-full bg-emerald-400/20 blur-3xl" />
                    </div>

                    <div className="relative">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs uppercase tracking-wide mb-5">
                            <Sparkles size={14} /> Secure Recovery
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold leading-tight">Recover Your Account</h1>
                        <p className="mt-3 text-slate-300 max-w-md">
                            Verify ownership with OTP and set a new strong password in a secure, guided flow.
                        </p>

                        <div className="mt-8 grid gap-3 max-w-md">
                            <FeatureRow icon={<Mail size={16} />} text="OTP delivered to your registered email" />
                            <FeatureRow icon={<ShieldCheck size={16} />} text="Secure reset with backend verification" />
                            <FeatureRow icon={<KeyRound size={16} />} text="Strong-password enforcement built in" />
                        </div>
                    </div>
                </section>

                <section className="p-8 md:p-10 lg:p-12">
                    <h2 className="text-2xl font-semibold mb-1">Forgot Password</h2>
                    <p className="text-sm text-slate-400 mb-7">
                        {step === 1 ? 'Send OTP to your registered email.' : 'Enter OTP and create a new password.'}
                    </p>

                    {step === 1 ? (
                        <form onSubmit={requestOtp} className="space-y-4">
                            <Label text="Registered Email" />
                            <InputWithIcon icon={<Mail size={16} className="text-slate-500" />}>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none"
                                    required
                                />
                            </InputWithIcon>

                            {message.text && <div className={`border rounded-lg px-3 py-2 text-sm ${messageClass}`}>{message.text}</div>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-60 font-semibold flex items-center justify-center gap-2"
                            >
                                {loading ? 'Sending OTP...' : 'Send OTP'}
                                {!loading && <ArrowRight size={16} />}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={resetPassword} className="space-y-4">
                            <Label text="OTP Code" />
                            <input
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none"
                                required
                            />

                            <Label text="New Password" />
                            <InputWithIcon icon={<Lock size={16} className="text-slate-500" />}>
                                <input
                                    type={showNewPassword ? 'text' : 'password'}
                                    placeholder="Enter new password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none"
                                    required
                                />
                                <button type="button" onClick={() => setShowNewPassword((v) => !v)} className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-200">
                                    {showNewPassword ? 'Hide' : 'Show'}
                                </button>
                            </InputWithIcon>

                            <Label text="Confirm New Password" />
                            <InputWithIcon icon={<Lock size={16} className="text-slate-500" />}>
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="Confirm new password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-slate-800 border border-slate-700 focus:border-emerald-500 focus:outline-none"
                                    required
                                />
                                <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-200">
                                    {showConfirmPassword ? 'Hide' : 'Show'}
                                </button>
                            </InputWithIcon>

                            {message.text && <div className={`border rounded-lg px-3 py-2 text-sm ${messageClass}`}>{message.text}</div>}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 disabled:opacity-60 font-semibold flex items-center justify-center gap-2"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                                {!loading && <ArrowRight size={16} />}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setStep(1);
                                    setMessage({ text: '', type: '' });
                                }}
                                className="w-full py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200"
                            >
                                Request New OTP
                            </button>
                        </form>
                    )}

                    <div className="text-center mt-5">
                        <button type="button" onClick={() => onNavigate('login')} className="text-sm text-emerald-300 hover:text-emerald-200">
                            Back to Login
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};

function FeatureRow({ icon, text }) {
    return (
        <div className="flex items-center gap-2.5 text-sm text-slate-200">
            <div className="p-1.5 rounded-md bg-slate-800 border border-slate-700 text-emerald-300">{icon}</div>
            <span>{text}</span>
        </div>
    );
}

function Label({ text }) {
    return <label className="text-sm text-slate-300">{text}</label>;
}

function InputWithIcon({ icon, children }) {
    return (
        <div className="relative">
            <span className="absolute left-3 top-3">{icon}</span>
            {children}
        </div>
    );
}

export default ForgotPassword;
