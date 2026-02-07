const nodemailer = require('nodemailer');

function getTransporter() {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT || 465);
    const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465;

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error('SMTP_USER and SMTP_PASS are required for OTP email sending');
    }

    return nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
}

async function sendOtpEmail(to, otp, purpose = 'signup') {
    const transporter = getTransporter();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    const subject = purpose === 'reset' ? 'EduPlan Password Reset OTP' : 'EduPlan Signup OTP Verification';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
        <h2>EduPlan Verification</h2>
        <p>Your one-time password is:</p>
        <div style="font-size: 30px; font-weight: 700; letter-spacing: 6px; margin: 18px 0;">${otp}</div>
        <p>This OTP expires in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `;

    await transporter.sendMail({
        from,
        to,
        subject,
        html
    });
}

module.exports = { sendOtpEmail };
