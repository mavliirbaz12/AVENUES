import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const logoBase64 = readFileSync(join(__dirname, 'logoBase64.txt'), 'utf8').trim();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

const verificationEmailTemplate = (firstName, verificationUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#111111;border-radius:4px;border:1px solid rgba(212,175,55,0.15);">

          <!-- Logo Header -->
          <tr>
            <td style="padding:40px 40px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06);">
              <img src="data:image/png;base64,${logoBase64}" alt="Avenues Perfume" width="120" style="display:block;margin:0 auto 16px;opacity:0.95;" />
              <h1 style="margin:0;font-size:22px;font-weight:400;letter-spacing:8px;color:#D4AF37;text-transform:uppercase;">Avenues Perfume</h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:48px 40px;">
              <h2 style="margin:0 0 28px;font-size:24px;font-weight:400;color:#ffffff;text-align:center;">Verify Your Email</h2>

              <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:rgba(255,255,255,0.6);">
                Hello ${firstName},
              </p>
              <p style="margin:0 0 36px;font-size:15px;line-height:1.8;color:rgba(255,255,255,0.6);">
                Thank you for joining Avenues Perfume. Please verify your email address to complete your account setup and start exploring our luxury fragrance collection.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:linear-gradient(135deg,#C8A827,#D4AF37,#F5CC55);border-radius:4px;">
                    <a href="${verificationUrl}" style="display:inline-block;padding:18px 52px;font-size:13px;font-weight:700;letter-spacing:3px;text-decoration:none;color:#0a0a0a;text-transform:uppercase;font-family:Georgia,serif;">Verify Email Address</a>
                  </td>
                </tr>
              </table>

              <!-- Fallback Link -->
              <p style="margin:36px 0 0;font-size:12px;line-height:1.8;color:rgba(255,255,255,0.3);text-align:center;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin:8px 0 0;font-size:11px;line-height:1.6;text-align:center;word-break:break-all;">
                <a href="${verificationUrl}" style="color:#D4AF37;text-decoration:underline;">${verificationUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:linear-gradient(to right,transparent,rgba(212,175,55,0.2),transparent);"></div>
            </td>
          </tr>

          <!-- Expiry Notice -->
          <tr>
            <td style="padding:28px 40px;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.3);text-align:center;">
                This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background-color:rgba(255,255,255,0.02);border-top:1px solid rgba(255,255,255,0.06);border-radius:0 0 4px 4px;">
              <p style="margin:0 0 8px;font-size:11px;color:rgba(255,255,255,0.2);text-align:center;letter-spacing:2px;text-transform:uppercase;">
                Avenues Perfume
              </p>
              <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.12);text-align:center;">
                &copy; 2026 Avenues Perfume. All rights reserved. Luxury Fragrance, Bold Identity.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export const sendVerificationEmail = async (email, firstName, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  await transporter.sendMail({
    from: `"Avenues Perfume" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - Avenues Perfume',
    html: verificationEmailTemplate(firstName, verificationUrl),
  });
};


const resetPasswordEmailTemplate = (firstName, resetUrl) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#0a0a0a;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#111111;border-radius:4px;border:1px solid rgba(212,175,55,0.15);">

          <!-- Logo Header -->
          <tr>
            <td style="padding:40px 40px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06);">
              <img src="data:image/png;base64,${logoBase64}" alt="Avenues Perfume" width="120" style="display:block;margin:0 auto 16px;opacity:0.95;" />
              <h1 style="margin:0;font-size:22px;font-weight:400;letter-spacing:8px;color:#D4AF37;text-transform:uppercase;">Avenues Perfume</h1>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:48px 40px;">
              <h2 style="margin:0 0 28px;font-size:24px;font-weight:400;color:#ffffff;text-align:center;">Reset Your Password</h2>

              <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:rgba(255,255,255,0.6);">
                Hello ${firstName},
              </p>
              <p style="margin:0 0 36px;font-size:15px;line-height:1.8;color:rgba(255,255,255,0.6);">
                We received a request to reset your password. Click the button below to set a new password. This link expires in 1 hour.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:linear-gradient(135deg,#C8A827,#D4AF37,#F5CC55);border-radius:4px;">
                    <a href="${resetUrl}" style="display:inline-block;padding:18px 52px;font-size:13px;font-weight:700;letter-spacing:3px;text-decoration:none;color:#0a0a0a;text-transform:uppercase;font-family:Georgia,serif;">Reset Password</a>
                  </td>
                </tr>
              </table>

              <!-- Fallback Link -->
              <p style="margin:36px 0 0;font-size:12px;line-height:1.8;color:rgba(255,255,255,0.3);text-align:center;">
                If the button does not work, copy and paste this link into your browser:
              </p>
              <p style="margin:8px 0 0;font-size:11px;line-height:1.6;text-align:center;word-break:break-all;">
                <a href="${resetUrl}" style="color:#D4AF37;text-decoration:underline;">${resetUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <div style="height:1px;background:linear-gradient(to right,transparent,rgba(212,175,55,0.2),transparent);"></div>
            </td>
          </tr>

          <!-- Expiry Notice -->
          <tr>
            <td style="padding:28px 40px;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.3);text-align:center;">
                This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background-color:rgba(255,255,255,0.02);border-top:1px solid rgba(255,255,255,0.06);border-radius:0 0 4px 4px;">
              <p style="margin:0 0 8px;font-size:11px;color:rgba(255,255,255,0.2);text-align:center;letter-spacing:2px;text-transform:uppercase;">
                Avenues Perfume
              </p>
              <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.12);text-align:center;">
                &copy; 2026 Avenues Perfume. All rights reserved. Luxury Fragrance, Bold Identity.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export const sendResetEmail = async (email, firstName, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  await transporter.sendMail({
    from: '"Avenues Perfume" <${process.env.GMAIL_USER}>',
    to: email,
    subject: 'Reset Your Password - Avenues Perfume',
    html: resetPasswordEmailTemplate(firstName, resetUrl),
  });
};
