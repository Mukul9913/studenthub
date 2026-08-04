import { renderEmailLayout } from "./layout.template.js";

export interface WelcomeEmailData {
  name: string;
  loginUrl?: string;
  role?: string;
}

/**
 * Welcome Email Template for newly registered students/owners on StudentHub.
 */
export function renderWelcomeTemplate(data: WelcomeEmailData): { subject: string; html: string } {
  const name = data.name || "Student";
  const loginUrl = data.loginUrl || "https://studenthub.in/login";

  const contentHtml = `
    <h1 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 700; color: #0f172a; line-height: 1.3;">
      Welcome to StudentHub, ${escapeHtml(name)}! 🎉
    </h1>
    <p style="margin: 0 0 16px 0; font-size: 15px; color: #334155; line-height: 1.6;">
      We're thrilled to have you onboard. StudentHub is Indore's premier marketplace connecting students and professionals with verified PGs, hostels, flats, and silent study libraries.
    </p>
    
    <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 8px; padding: 16px 20px; margin: 24px 0;">
      <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1e293b;">What you can do next:</h3>
      <ul style="margin: 0; padding-left: 20px; color: #475569; font-size: 14px; line-height: 1.7;">
        <li>Browse 100% verified study libraries & PGs in Bhawarkua, Vijay Nagar, & Palasia</li>
        <li>Connect directly with owners — 0 broker fees</li>
        <li>Schedule direct visit requests</li>
        <li>Set up your study & budget preferences for personalized picks</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 32px 0 24px 0;">
      <a href="${loginUrl}" target="_blank" class="btn-primary" style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 15px; font-weight: 600; padding: 14px 28px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);">
        Explore StudentHub Dashboard
      </a>
    </div>

    <p style="margin: 0; font-size: 13px; color: #64748b; text-align: center;">
      If the button above doesn't work, copy and paste this link in your browser:<br>
      <a href="${loginUrl}" style="color: #4f46e5; text-decoration: underline;">${loginUrl}</a>
    </p>
  `;

  const html = renderEmailLayout({
    title: "Welcome to StudentHub!",
    previewText: `Welcome to StudentHub, ${name}! Discover verified PGs, Hostels & Study Libraries in Indore.`,
    contentHtml,
  });

  return {
    subject: "Welcome to StudentHub! Find Your Ideal PG & Study Library in Indore",
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
