import type {
  WelcomeEmailData,
  VerifyEmailData,
  ForgotPasswordEmailData,
  ResetPasswordSuccessEmailData,
  ContactFormEmailData,
  AdminNotificationEmailData,
} from "./email.types.js";

const PRIMARY_COLOR = "#0E7490"; // StudentHub Deep Cyan Brand Color
const COMPANY_NAME = "StudentHub Technologies Pvt. Ltd.";
const SUPPORT_EMAIL = "support@studenthub.in";
const WEBSITE_URL = "https://studenthub.in";

/**
 * Base Responsive HTML Layout wrapper for all StudentHub Emails.
 */
export function renderBaseEmailLayout(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #F8FAFC;
      color: #1E293B;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #F8FAFC;
      padding: 40px 16px;
    }
    .main-card {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      border: 1px solid #E2E8F0;
    }
    .header {
      background-color: ${PRIMARY_COLOR};
      padding: 28px 32px;
      text-align: center;
    }
    .header h1 {
      color: #FFFFFF;
      font-size: 24px;
      font-weight: 800;
      margin: 0;
      letter-spacing: -0.5px;
    }
    .header p {
      color: rgba(255, 255, 255, 0.85);
      font-size: 13px;
      margin: 4px 0 0 0;
    }
    .content {
      padding: 36px 32px;
      font-size: 15px;
      line-height: 1.6;
      color: #334155;
    }
    .btn {
      display: inline-block;
      background-color: ${PRIMARY_COLOR};
      color: #FFFFFF !important;
      font-weight: 700;
      font-size: 14px;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 10px;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      background-color: #F1F5F9;
      padding: 24px 32px;
      text-align: center;
      font-size: 12px;
      color: #64748B;
      border-top: 1px solid #E2E8F0;
    }
    .footer a {
      color: ${PRIMARY_COLOR};
      text-decoration: none;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main-card">
      <div class="header">
        <h1>StudentHub</h1>
        <p>Indore's #1 Student Ecosystem Marketplace</p>
      </div>
      <div class="content">
        ${bodyContent}
      </div>
      <div class="footer">
        <p style="margin: 0 0 8px 0;"><strong>${COMPANY_NAME}</strong></p>
        <p style="margin: 0 0 8px 0;">Have questions? Contact us at <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a></p>
        <p style="margin: 0;"><a href="${WEBSITE_URL}">${WEBSITE_URL}</a> &bull; Indore, Madhya Pradesh, India</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ─── Welcome Email Template ──────────────────────────────────────────────────

export function renderWelcomeEmailTemplate(data: WelcomeEmailData): string {
  const content = `
    <h2 style="color: #0F172A; margin-top: 0; font-size: 20px;">Welcome to StudentHub, ${data.userName}! 🎉</h2>
    <p>We're thrilled to have you join Indore's leading platform for student accommodations, PGs, hostels, and 24x7 silent study libraries.</p>
    <p>Whether you're preparing for competitive exams in Bhawarkua or exploring verified places in Vijay Nagar & Palasia, StudentHub connects you directly with verified owners with <strong>zero brokerage fees</strong>.</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${data.dashboardLink || WEBSITE_URL}" class="btn">Explore StudentHub Dashboard &rarr;</a>
    </div>
    <p style="font-size: 13px; color: #64748B;">Tip: Complete your student preferences profile to get AI-powered listing recommendations tailored to your budget and coaching institute.</p>
  `;
  return renderBaseEmailLayout("Welcome to StudentHub!", content);
}

// ─── Verify Email Template ───────────────────────────────────────────────────

export function renderVerifyEmailTemplate(data: VerifyEmailData): string {
  const content = `
    <h2 style="color: #0F172A; margin-top: 0; font-size: 20px;">Verify Your Email Address</h2>
    <p>Hello ${data.userName},</p>
    <p>Thank you for signing up on StudentHub. Please confirm your email address by clicking the button below to activate your account and start contacting property owners.</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${data.verificationUrl}" class="btn">Verify Email Address &rarr;</a>
    </div>
    <p style="font-size: 13px; color: #64748B;">This link is valid for <strong>${data.expiresInMinutes || 60} minutes</strong>. If you did not create an account on StudentHub, you can safely ignore this email.</p>
  `;
  return renderBaseEmailLayout("Verify Your StudentHub Email", content);
}

// ─── Forgot Password Template ────────────────────────────────────────────────

export function renderForgotPasswordTemplate(data: ForgotPasswordEmailData): string {
  const content = `
    <h2 style="color: #0F172A; margin-top: 0; font-size: 20px;">Reset Your Password</h2>
    <p>Hello ${data.userName},</p>
    <p>We received a request to reset the password for your StudentHub account. Click the button below to set up a new password:</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${data.resetUrl}" class="btn">Reset My Password &rarr;</a>
    </div>
    <p style="font-size: 13px; color: #64748B;">This link will expire in <strong>${data.expiresInMinutes || 30} minutes</strong>. If you did not request a password reset, please secure your account.</p>
  `;
  return renderBaseEmailLayout("Reset Your StudentHub Password", content);
}

// ─── Password Reset Success Template ─────────────────────────────────────────

export function renderResetPasswordSuccessTemplate(data: ResetPasswordSuccessEmailData): string {
  const content = `
    <h2 style="color: #0F172A; margin-top: 0; font-size: 20px;">Password Changed Successfully</h2>
    <p>Hello ${data.userName},</p>
    <p>Your password for StudentHub was successfully updated on <strong>${data.timestamp || new Date().toLocaleString("en-IN")}</strong>.</p>
    <p>If you made this change, you can now log in using your new credentials:</p>
    <div style="text-align: center; margin: 24px 0;">
      <a href="${data.loginUrl || `${WEBSITE_URL}/login`}" class="btn">Log In Now &rarr;</a>
    </div>
    <p style="font-size: 13px; color: #EF4444;">If you did not perform this action, please contact support immediately at support@studenthub.in.</p>
  `;
  return renderBaseEmailLayout("StudentHub Security Alert: Password Updated", content);
}

// ─── Contact Form Template ───────────────────────────────────────────────────

export function renderContactFormEmailTemplate(data: ContactFormEmailData): string {
  const content = `
    <h2 style="color: #0F172A; margin-top: 0; font-size: 20px;">New Contact Form Message</h2>
    <div style="background-color: #F8FAFC; border-radius: 12px; padding: 20px; border: 1px solid #E2E8F0; margin: 20px 0;">
      <p style="margin: 0 0 8px 0;"><strong>Sender:</strong> ${data.senderName} (${data.senderEmail})</p>
      ${data.senderPhone ? `<p style="margin: 0 0 8px 0;"><strong>Phone:</strong> ${data.senderPhone}</p>` : ""}
      <p style="margin: 0 0 8px 0;"><strong>Subject:</strong> ${data.subject}</p>
      <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 12px 0;">
      <p style="margin: 0; white-space: pre-wrap; color: #334155;">${data.message}</p>
    </div>
  `;
  return renderBaseEmailLayout(`Contact Form: ${data.subject}`, content);
}

// ─── OTP Email Template ──────────────────────────────────────────────────────

export function renderOtpEmailTemplate(
  userName: string,
  otpCode: string,
  purpose: "VERIFY_EMAIL" | "FORGOT_PASSWORD" = "VERIFY_EMAIL",
): string {
  const isVerify = purpose === "VERIFY_EMAIL";
  const title = isVerify ? "Verify Your Email Address" : "Reset Your Password";
  const heading = isVerify ? "Your Verification Code" : "Password Reset OTP";
  const message = isVerify
    ? "Please enter the 6-digit OTP code below to activate your StudentHub account and verify your email:"
    : "You requested a password reset for your StudentHub account. Use the 6-digit OTP code below to proceed:";

  const content = `
    <h2 style="color: #0F172A; margin-top: 0; font-size: 20px;">${heading}</h2>
    <p>Hello ${userName},</p>
    <p>${message}</p>
    <div style="text-align: center; margin: 32px 0;">
      <div style="display: inline-block; background-color: #F1F5F9; border: 2px dashed ${PRIMARY_COLOR}; border-radius: 16px; padding: 18px 36px; letter-spacing: 10px; font-size: 32px; font-weight: 800; color: ${PRIMARY_COLOR}; font-family: monospace;">
        ${otpCode}
      </div>
    </div>
    <p style="font-size: 13px; color: #64748B; text-align: center;">
      ⏱️ This code will expire in <strong>5 minutes</strong>. Do not share this OTP with anyone.
    </p>
  `;
  return renderBaseEmailLayout(title, content);
}

export function renderVerificationSuccessEmailTemplate(userName: string): string {
  const content = `
    <h2 style="color: #0F172A; margin-top: 0; font-size: 20px;">Account Verified Successfully! 🎉</h2>
    <p>Hello ${userName},</p>
    <p>Your email address has been successfully verified! Your StudentHub account is now fully active.</p>
    <p>You can now explore verified PGs, Hostels, and 24x7 Silent Libraries across Indore with zero brokerage fees.</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${WEBSITE_URL}/accommodations" class="btn">Explore Accommodations &rarr;</a>
    </div>
  `;
  return renderBaseEmailLayout("StudentHub Email Verified", content);
}

export function renderAdminNotificationEmailTemplate(data: AdminNotificationEmailData): string {
  const content = `
    <h2 style="color: #0F172A; margin-top: 0; font-size: 20px;">${data.title}</h2>
    <p>${data.details}</p>
  `;
  return renderBaseEmailLayout(`Admin Alert: ${data.title}`, content);
}
