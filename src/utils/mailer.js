const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.MAIL_PORT || '587'),
  secure: process.env.MAIL_SECURE === 'true',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendOtpEmail = async (to, otp) => {
  await transporter.sendMail({
    from: process.env.MAIL_FROM || `SplitEasy <${process.env.MAIL_USER}>`,
    to,
    subject: 'Your SplitEasy verification code',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:16px;border:1px solid #e2e8f0">
        <div style="text-align:center;margin-bottom:24px">
          <h2 style="color:#4f46e5;margin:0 0 4px">SplitEasy</h2>
          <p style="color:#94a3b8;margin:0;font-size:13px">Split bills. Stay friends.</p>
        </div>
        <p style="color:#475569;margin-bottom:8px">Your email verification code is:</p>
        <div style="background:#fff;border:2px solid #6366f1;border-radius:12px;padding:24px;text-align:center;letter-spacing:14px;font-size:36px;font-weight:900;color:#4f46e5;margin:16px 0">${otp}</div>
        <p style="color:#94a3b8;font-size:12px;margin-top:16px;text-align:center">
          This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
        </p>
      </div>
    `,
  });
};

module.exports = { sendOtpEmail };
