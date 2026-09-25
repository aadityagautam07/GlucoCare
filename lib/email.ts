import nodemailer from "nodemailer";

export interface SendResetEmailParams {
  to: string;
  name: string;
  token: string;
  resetUrl: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}

/**
 * Creates and returns a configured Nodemailer Transporter.
 * Uses custom SMTP credentials if supplied via environment variables,
 * or falls back to an Ethereal test account for seamless offline/dev verification.
 */
async function getEmailTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // Real SMTP configured
  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  // Fallback: ephemeral test account with Ethereal email
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (err) {
    console.warn("Could not generate Ethereal test account, using JSON transport:", err);
    return nodemailer.createTransport({
      jsonTransport: true,
    });
  }
}

/**
 * Sends a password reset email via SMTP with professional responsive HTML styling.
 */
export async function sendPasswordResetEmail({
  to,
  name,
  token,
  resetUrl,
}: SendResetEmailParams): Promise<EmailSendResult> {
  try {
    const transporter = await getEmailTransporter();
    const fromAddress =
      process.env.SMTP_FROM || '"GlucoCare Health Support" <noreply@glucocare.health>';

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your GlucoCare Password</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; color: #1e293b; }
    .container { max-width: 580px; margin: 30px auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #1e40af, #0d9488); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 32px 28px; line-height: 1.6; font-size: 15px; color: #334155; }
    .code-box { background: #f1f5f9; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
    .code { font-family: 'SF Mono', Consolas, Monaco, monospace; font-size: 28px; font-weight: 800; color: #1e40af; letter-spacing: 4px; }
    .btn-container { text-align: center; margin: 28px 0; }
    .btn { display: inline-block; background-color: #1e40af; color: #ffffff !important; padding: 14px 32px; border-radius: 10px; font-weight: 700; text-decoration: none; font-size: 15px; box-shadow: 0 4px 12px rgba(30,64,175,0.25); }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>GlucoCare</h1>
      <p>Secure Medical Data & Daily Diabetes Companion</p>
    </div>
    <div class="content">
      <p>Hello <strong>${name}</strong>,</p>
      <p>We received a request to reset the password for your GlucoCare account (<strong>${to}</strong>).</p>
      
      <p>Click the secure link below to reset your password. This link is valid for <strong>60 minutes</strong>:</p>
      
      <div class="btn-container">
        <a href="${resetUrl}" class="btn" target="_blank">Reset My Password</a>
      </div>

      <p>Or you can copy and enter this direct verification code on the password reset page:</p>

      <div class="code-box">
        <div class="code">${token}</div>
        <div style="font-size: 12px; color: #64748b; margin-top: 6px;">One-Time Security Reset Token</div>
      </div>

      <p style="font-size: 13px; color: #64748b;">If the button above does not work, copy and paste this URL into your browser:<br>
      <a href="${resetUrl}" style="color: #1e40af; word-break: break-all;">${resetUrl}</a></p>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">
        If you did not request this password reset, please ignore this email or contact support if you suspect unauthorized activity. Your current password remains completely unchanged.
      </p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} GlucoCare Health Portal. All rights reserved.
    </div>
  </div>
</body>
</html>
    `;

    const textContent = `
Hello ${name},

We received a request to reset your password for your GlucoCare account (${to}).

Your verification code is: ${token}

You can reset your password by visiting this link:
${resetUrl}

This link is valid for 60 minutes.

If you did not request this change, please ignore this email.
`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      subject: "Reset Your GlucoCare Password",
      text: textContent,
      html: htmlContent,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    console.log(`Password reset email dispatched to ${to}. MessageId: ${info.messageId}`);
    if (previewUrl) {
      console.log(`Ethereal email preview available at: ${previewUrl}`);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl ? String(previewUrl) : undefined,
    };
  } catch (error) {
    console.error("sendPasswordResetEmail error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "SMTP delivery failed",
    };
  }
}

