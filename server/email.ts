import nodemailer from 'nodemailer';

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
}: SendOtpParams): Promise<{ success: boolean; simulated: boolean; message: string; debugOtp?: string }> {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  const isConfigured = Boolean(
    gmailUser &&
    gmailPass &&
    !gmailUser.includes('your-company') &&
    !gmailPass.includes('xxxx')
  );

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
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; padding: 24px; }
        .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .logo { font-size: 22px; font-weight: 700; color: #2563eb; letter-spacing: -0.5px; margin-bottom: 24px; display: inline-block; }
        .title { font-size: 20px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
        .text { font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
        .otp-box { text-align: center; background: #eff6ff; border: 2px dashed #3b82f6; border-radius: 8px; padding: 18px; margin-bottom: 24px; }
        .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1d4ed8; font-family: monospace; }
        .meta { font-size: 13px; color: #64748b; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="logo">ReputePulse</div>
        <div class="title">${purpose === 'registration' ? 'Verify Your Email Address' : 'Password Reset Request'}</div>
        <div class="text">${greeting}<br>Please use the one-time verification code below to ${actionText}. This code will expire in <strong>10 minutes</strong>.</div>
        <div class="otp-box">
          <div class="otp-code">${otpCode}</div>
        </div>
        <div class="meta">
          If you did not request this verification code, please ignore this email or contact support if you suspect unauthorized access. For security, never share this code with anyone.
        </div>
      </div>
    </body>
    </html>
  `;

  if (isConfigured) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass?.replace(/\s+/g, ''),
        },
      });

      await transporter.sendMail({
        from: `"ReputePulse Security" <${gmailUser}>`,
        to: toEmail,
        subject,
        html: htmlContent,
      });

      console.log(`[SMTP SUCCESS] Dispatched OTP ${otpCode} to ${toEmail} via Gmail.`);
      return {
        success: true,
        simulated: false,
        message: `Verification code sent to ${toEmail} via Gmail SMTP.`,
      };
    } catch (err: any) {
      console.error(`[SMTP ERROR] Failed to send via Gmail SMTP:`, err.message);
      // Fallback gracefully so customer can proceed during dev
      return {
        success: true,
        simulated: true,
        message: `Gmail SMTP encountered an error (${err.message}). Verification code is available in dev console.`,
        debugOtp: otpCode,
      };
    }
  } else {
    console.log(`[SMTP SIMULATOR] GMAIL_USER / GMAIL_APP_PASSWORD not set. Generated OTP for ${toEmail}: ${otpCode}`);
    return {
      success: true,
      simulated: true,
      message: `Verification code generated in development simulation mode.`,
      debugOtp: otpCode,
    };
  }
}
