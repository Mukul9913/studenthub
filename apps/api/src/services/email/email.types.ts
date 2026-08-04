import type { SendMailOptions } from "nodemailer";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: SendMailOptions["attachments"];
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  recipient: string;
  templateName?: string;
  durationMs: number;
  error?: string;
}

export interface WelcomeEmailData {
  userName: string;
  userRole?: string;
  dashboardLink?: string;
}

export interface VerifyEmailData {
  userName: string;
  verificationUrl: string;
  expiresInMinutes?: number;
}

export interface ForgotPasswordEmailData {
  userName: string;
  resetUrl: string;
  expiresInMinutes?: number;
}

export interface ResetPasswordSuccessEmailData {
  userName: string;
  loginUrl?: string;
  timestamp?: string;
}

export interface ContactFormEmailData {
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  subject: string;
  message: string;
}

export interface AdminNotificationEmailData {
  title: string;
  details: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, unknown>;
}
