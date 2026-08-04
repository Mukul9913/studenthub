import { renderEmailLayout } from "./layout.template.js";

export interface VerifyEmailData {
  name: string;
  verificationUrl: string;
  otpCode?: string;
  expiresInMinutes?: number;
}

/**
 * Account / Email Verification Template.
 */
export function renderVerifyEmailTemplate(data: VerifyEmailData): {
  subject: string;
  html: string;
} {
  const name = data.name || "User";
  const minutes = data.expiresInMinutes || 30;

  const contentHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.3;">
      Verify Your Email Address
    </h1>
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155; line-height: 1.6;">
      Hello ${escapeHtml(name)}, thank you for signing up on StudentHub. Please confirm your email address by clicking the button below.
    </p>

    ${
      data.otpCode
        ? `<div style="background-color: #f1f5f9; border: 1px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
            <p style="margin: 0; font-size: 32px; font-weight: 800; color: #4f46e5; letter-spacing: 6px; font-family: monospace;">${escapeHtml(data.otpCode)}</p>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #94a3b8;">Valid for ${minutes} minutes</p>
          </div>`
        : ""
    }

    <div style="text-align: center; margin: 32px 0 24px 0;">
      <a href="${data.verificationUrl}" target="_blank" class="btn-primary" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 15px; font-weight: 600; padding: 14px 28px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);">
        Verify Email Address
      </a>
    </div>

    <p style="margin: 0 0 16px 0; font-size: 13px; color: #64748b; line-height: 1.5; text-align: center;">
      This verification link will expire in <strong>${minutes} minutes</strong> for security purposes.
    </p>

    <p style="margin: 0; font-size: 12px; color: #94a3b8; text-align: center;">
      If you did not create a StudentHub account, please ignore this email.
    </p>
  `;

  const html = renderEmailLayout({
    title: "Verify Your Email Address - StudentHub",
    previewText: `Please verify your email address to activate your StudentHub account.`,
    contentHtml,
  });

  return {
    subject: "Verify Your Email Address - StudentHub",
    html,
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
