import { renderEmailLayout } from "./layout.template.js";

export interface ForgotPasswordEmailData {
  name: string;
  resetUrl: string;
  otpCode?: string;
  expiresInMinutes?: number;
}

/**
 * Forgot Password Request Template.
 */
export function renderForgotPasswordTemplate(data: ForgotPasswordEmailData): {
  subject: string;
  html: string;
} {
  const name = data.name || "User";
  const minutes = data.expiresInMinutes || 15;

  const contentHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.3;">
      Password Reset Request 🔐
    </h1>
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155; line-height: 1.6;">
      Hello ${escapeHtml(name)}, we received a request to reset your StudentHub account password. Click the button below to set a new password.
    </p>

    ${
      data.otpCode
        ? `<div style="background-color: #fffbebf7; border: 1px solid #fde68a; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
            <p style="margin: 0 0 8px 0; font-size: 12px; color: #b45309; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Your Reset Code</p>
            <p style="margin: 0; font-size: 32px; font-weight: 800; color: #d97706; letter-spacing: 6px; font-family: monospace;">${escapeHtml(data.otpCode)}</p>
            <p style="margin: 8px 0 0 0; font-size: 12px; color: #b45309;">Expires in ${minutes} minutes</p>
          </div>`
        : ""
    }

    <div style="text-align: center; margin: 32px 0 24px 0;">
      <a href="${data.resetUrl}" target="_blank" class="btn-primary" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 15px; font-weight: 600; padding: 14px 28px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);">
        Reset Password
      </a>
    </div>

    <div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
        <strong>Security Notice:</strong> This link is valid for <strong>${minutes} minutes</strong>. If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>
    </div>
  `;

  const html = renderEmailLayout({
    title: "Reset Your Password - StudentHub",
    previewText: `Password reset request for your StudentHub account.`,
    contentHtml,
  });

  return {
    subject: "Reset Your Password - StudentHub",
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
