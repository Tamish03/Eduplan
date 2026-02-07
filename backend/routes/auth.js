const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { sendOtpEmail } = require('../utils/mailer');

const router = express.Router();

const OTP_TTL_MINUTES = 10;

function emailValid(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function passwordValid(password) {
    return (
        password.length >= 8 &&
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /\d/.test(password) &&
        /[!@#$%^&*(),.?":{}|<>]/.test(password)
    );
}

function hashOtp(otp) {
    return crypto.createHash('sha256').update(otp).digest('hex');
}

function issueOtp(email, purpose) {
    return new Promise((resolve, reject) => {
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();

        db.run('DELETE FROM email_otps WHERE email = ? AND purpose = ? AND used = 0', [email, purpose], (cleanupErr) => {
            if (cleanupErr) {
                reject(cleanupErr);
                return;
            }

            db.run(
                `INSERT INTO email_otps (id, email, otp_hash, purpose, expires_at, used)
                 VALUES (?, ?, ?, ?, ?, 0)`,
                [uuidv4(), email, hashOtp(otp), purpose, expiresAt],
                (err) => {
                    if (err) reject(err);
                    else resolve(otp);
                }
            );
        });
    });
}

function verifyOtp(email, purpose, otp) {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM email_otps
             WHERE email = ? AND purpose = ? AND used = 0
             ORDER BY created_at DESC LIMIT 1`,
            [email, purpose],
            (err, row) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (!row) {
                    resolve({ ok: false, reason: 'No OTP found' });
                    return;
                }

                const now = new Date();
                if (now > new Date(row.expires_at)) {
                    resolve({ ok: false, reason: 'OTP expired' });
                    return;
                }

                if (row.otp_hash !== hashOtp(otp)) {
                    resolve({ ok: false, reason: 'Invalid OTP' });
                    return;
                }

                db.run('UPDATE email_otps SET used = 1 WHERE id = ?', [row.id], (updateErr) => {
                    if (updateErr) {
                        reject(updateErr);
                        return;
                    }
                    resolve({ ok: true });
                });
            }
        );
    });
}

router.post('/send-signup-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !emailValid(email)) {
            return res.status(400).json({ error: 'Valid email is required' });
        }

        const existing = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (existing) {
            return res.status(409).json({ error: 'Email is already registered' });
        }

        const otp = await issueOtp(email.toLowerCase(), 'signup');
        await sendOtpEmail(email.toLowerCase(), otp, 'signup');

        return res.json({ message: 'OTP sent successfully', expiresInMinutes: OTP_TTL_MINUTES });
    } catch (error) {
        console.error('send-signup-otp error:', error);
        return res.status(500).json({ error: 'Failed to send OTP email', details: error.message });
    }
});

router.post('/signup', async (req, res) => {
    try {
        const { fullName, email, password, otp } = req.body;
        const normalizedEmail = (email || '').toLowerCase();

        if (!fullName || !normalizedEmail || !password || !otp) {
            return res.status(400).json({ error: 'fullName, email, password, and otp are required' });
        }

        if (!emailValid(normalizedEmail)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        if (!passwordValid(password)) {
            return res.status(400).json({ error: 'Password does not meet security requirements' });
        }

        const otpCheck = await verifyOtp(normalizedEmail, 'signup', otp);
        if (!otpCheck.ok) {
            return res.status(400).json({ error: otpCheck.reason });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        db.run(
            `INSERT INTO users (id, full_name, email, password_hash, email_verified)
             VALUES (?, ?, ?, ?, 1)`,
            [uuidv4(), fullName.trim(), normalizedEmail, passwordHash],
            function (err) {
                if (err) {
                    if (err.message && err.message.includes('UNIQUE')) {
                        return res.status(409).json({ error: 'Email is already registered' });
                    }
                    return res.status(500).json({ error: err.message });
                }

                return res.status(201).json({
                    message: 'Account created successfully',
                    user: { email: normalizedEmail, name: fullName.trim() }
                });
            }
        );
    } catch (error) {
        console.error('signup error:', error);
        return res.status(500).json({ error: 'Signup failed', details: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = (email || '').toLowerCase();

        if (!normalizedEmail || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        if (normalizedEmail === 'demo@eduplan.ai' && password === 'Demo@123') {
            return res.json({
                message: 'Login successful',
                token: `demo_token_${Date.now()}`,
                user: { email: normalizedEmail, name: 'Demo User' }
            });
        }

        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        return res.json({
            message: 'Login successful',
            token: `token_${Date.now()}`,
            user: { email: user.email, name: user.full_name }
        });
    } catch (error) {
        console.error('login error:', error);
        return res.status(500).json({ error: 'Login failed', details: error.message });
    }
});

router.post('/send-reset-otp', async (req, res) => {
    try {
        const { email } = req.body;
        const normalizedEmail = (email || '').toLowerCase();

        if (!normalizedEmail || !emailValid(normalizedEmail)) {
            return res.status(400).json({ error: 'Valid email is required' });
        }

        const user = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM users WHERE email = ?', [normalizedEmail], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!user) {
            return res.status(404).json({ error: 'No account found for this email' });
        }

        const otp = await issueOtp(normalizedEmail, 'reset');
        await sendOtpEmail(normalizedEmail, otp, 'reset');

        return res.json({ message: 'Reset OTP sent successfully', expiresInMinutes: OTP_TTL_MINUTES });
    } catch (error) {
        console.error('send-reset-otp error:', error);
        return res.status(500).json({ error: 'Failed to send reset OTP', details: error.message });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const normalizedEmail = (email || '').toLowerCase();

        if (!normalizedEmail || !otp || !newPassword) {
            return res.status(400).json({ error: 'email, otp, and newPassword are required' });
        }

        if (!passwordValid(newPassword)) {
            return res.status(400).json({ error: 'New password does not meet security requirements' });
        }

        const otpCheck = await verifyOtp(normalizedEmail, 'reset', otp);
        if (!otpCheck.ok) {
            return res.status(400).json({ error: otpCheck.reason });
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);

        db.run(
            'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?',
            [passwordHash, normalizedEmail],
            function (err) {
                if (err) return res.status(500).json({ error: err.message });
                if (this.changes === 0) return res.status(404).json({ error: 'User not found' });

                return res.json({ message: 'Password reset successful' });
            }
        );
    } catch (error) {
        console.error('reset-password error:', error);
        return res.status(500).json({ error: 'Password reset failed', details: error.message });
    }
});

module.exports = router;
