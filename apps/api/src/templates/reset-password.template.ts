import { renderEmailLayout } from "./layout.template.js";

export interface ResetPasswordEmailData {
  name: string;
  loginUrl?: string;
  updatedAt?: string;
}

/**
 * Password Reset Confirmation Template.
 */
export function renderResetPasswordTemplate(data: ResetPasswordEmailData): {
  subject: string;
  html: string;
} {
  const name = data.name || "User";
  const loginUrl = data.loginUrl || "https://studenthub.in/login";
  const timestamp =
    data.updatedAt || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const contentHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.3;">
      Password Changed Successfully ✅
    </h1>
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155; line-height: 1.6;">
      Hello ${escapeHtml(name)}, your StudentHub account password was successfully updated on <strong>${escapeHtml(timestamp)} IST</strong>.
    </p>

    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px 20px; margin: 24px 0;">
      <p style="margin: 0; font-size: 14px; color: #166534; line-height: 1.5;">
        You can now log in using your new password. All active sessions have been secured.
      </p>
    </div>

    <div style="text-align: center; margin: 32px 0 24px 0;">
      <a href="${loginUrl}" target="_blank" class="btn-primary" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 15px; font-weight: 600; padding: 14px 28px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);">
        Log In to StudentHub
      </a>
    </div>

    <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-top: 24px;">
      <p style="margin: 0; font-size: 13px; color: #991b1b; line-height: 1.5;">
        <strong>Didn't make this change?</strong> If you did not update your password, please contact our support team immediately at <a href="mailto:support@studenthub.in" style="color: #991b1b; font-weight: 600;">support@studenthub.in</a> to protect your account.
      </p>
    </div>
  `;

  const html = renderEmailLayout({
    title: "Password Changed - StudentHub",
    previewText: `Your StudentHub account password was successfully changed.`,
    contentHtml,
  });

  return {
    subject: "Security Notice: Your StudentHub Password Was Changed",
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
