import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ override: true });

interface SendOtpParams {
  toEmail: string;
  otpCode: string;
  purpose: 'registration' | 'password_reset';
  customerName?: string;
}

export async function sendOtpEmail({
  toEmail,
  otpCode,
  purpose,
  customerName,
}: SendOtpParams): Promise<{ success: boolean; message: string }> {
  const gmailUser = (process.env.GMAIL_USER || '').trim();
  const gmailPass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '').trim();

  if (!gmailUser || !gmailPass) {
    throw new Error('Gmail SMTP credentials are not configured in environment variables.');
  }

  const subject =
    purpose === 'registration'
      ? `Verify Your ReputePulse Account - OTP: ${otpCode}`
      : `Reset Your ReputePulse Password - OTP: ${otpCode}`;

  const greeting = customerName ? `Hello ${customerName},` : 'Hello,';
  const actionText =
    purpose === 'registration'
      ? 'complete your customer account registration'
      : 'reset your account password';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; padding: 24px; margin: 0; }
        .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .logo { font-size: 22px; font-weight: 700; color: #1a73e8; letter-spacing: -0.5px; margin-bottom: 24px; display: inline-block; }
        .title { font-size: 20px; font-weight: 600; color: #202124; margin-bottom: 12px; }
        .text { font-size: 15px; color: #3c4043; line-height: 1.6; margin-bottom: 24px; }
        .otp-box { text-align: center; background: #e8f0fe; border: 2px dashed #1a73e8; border-radius: 8px; padding: 18px; margin-bottom: 24px; }
        .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1a73e8; font-family: monospace; }
        .meta { font-size: 13px; color: #5f6368; line-height: 1.5; border-top: 1px solid #f1f3f4; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">ReputePulse &bull; Google Business Profile</div>
        <div class="title">${purpose === 'registration' ? 'Verify Your Email Address' : 'Password Reset Request'}</div>
        <div class="text">${greeting}<br>Please use the one-time verification code below to ${actionText}. This code will expire in <strong>10 minutes</strong>.</div>
        <div class="otp-box">
          <div class="otp-code">${otpCode}</div>
        </div>
        <div class="meta">
          If you did not request this verification code, please ignore this email. For your security, never share this code with anyone.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    await transporter.sendMail({
      from: `"ReputePulse Security" <${gmailUser}>`,
      to: toEmail,
      subject,
      html: htmlContent,
    });

    console.log(`[SMTP PRODUCTION SUCCESS] Dispatched OTP code to ${toEmail} via Gmail.`);
    return {
      success: true,
      message: `A 6-digit verification code has been dispatched to ${toEmail}. Please check your inbox.`,
    };
  } catch (err: any) {
    console.error(`[SMTP ERROR] Failed to send via Gmail SMTP:`, err.message);
    throw new Error(`Failed to dispatch email to ${toEmail}: ${err.message}`);
  }
}
