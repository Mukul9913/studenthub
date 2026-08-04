# StudentHub SMTP Email Service Setup & Documentation

Production-ready Email Service built for StudentHub using **Nodemailer**, **Gmail SMTP**, **Zod**, and **Pino Logger**.

---

## 📁 Architecture & Folder Structure

```
apps/api/src/
├── config/
│   ├── env.ts             # Zod environment variable parser
│   └── mail.ts            # SMTP configuration, Zod validator & singleton transporter
├── services/
│   └── email.service.ts   # Reusable email service, provider interface (IEmailProvider), & log masking
├── templates/
│   ├── layout.template.ts            # Reusable responsive HTML email layout with StudentHub branding
│   ├── welcome.template.ts           # Welcome email template
│   ├── verify-email.template.ts      # Account / Email verification template
│   ├── forgot-password.template.ts   # Password reset OTP/link template
│   └── reset-password.template.ts    # Password changed confirmation template
├── controllers/
│   └── email.controller.ts           # API endpoint handlers (/api/email/test)
└── routes/
    └── email.routes.ts              # Route definitions
```

---

## ⚙️ Environment Variables

Add the following variables to your `apps/api/.env` file:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=mukuldixit931@gmail.com
SMTP_PASS=atjt tixp ubzo jlrp
MAIL_FROM="StudentHub <mukuldixit931@gmail.com>"
```

### Environment Variable Reference

| Variable      | Type    | Default          | Description                                                         |
| :------------ | :------ | :--------------- | :------------------------------------------------------------------ |
| `SMTP_HOST`   | String  | `smtp.gmail.com` | SMTP host address                                                   |
| `SMTP_PORT`   | Number  | `587`            | Port (587 for TLS / STARTTLS, 465 for SSL)                          |
| `SMTP_SECURE` | Boolean | `false`          | `true` for port 465 (SSL), `false` for port 587 (TLS/STARTTLS)      |
| `SMTP_USER`   | String  | Required         | Sender Gmail address                                                |
| `SMTP_PASS`   | String  | Required         | Gmail 16-character **App Password** (NOT personal password)         |
| `MAIL_FROM`   | String  | Required         | Default `From` header string (e.g. `"StudentHub <user@gmail.com>"`) |

---

## 🔐 How Gmail App Password Works

Gmail requires a 16-character **App Password** when sending emails programmatically via SMTP:

1. **Enable 2-Step Verification**:
   - Go to [Google Account Security](https://myaccount.google.com/security).
   - Under _How you sign in to Google_, turn on **2-Step Verification**.

2. **Generate an App Password**:
   - Search for **App Passwords** in your Google Account settings (or visit [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)).
   - Select App Name: Enter `StudentHub API`.
   - Click **Create**.

3. **Configure Environment Variable**:
   - Google will generate a 16-character code (e.g., `atjt tixp ubzo jlrp`).
   - Copy this 16-character string into `SMTP_PASS` in your `.env` file (spaces are automatically handled or stripped).

> ⚠️ **Security Warning**: Never commit `SMTP_PASS` or raw credentials to Git. `email.service.ts` automatically masks recipient emails in production logs (`m***t@gmail.com`) and redacts passwords.

---

## 🚀 API Endpoint Reference

### Send Test Welcome Email

- **HTTP Method**: `POST`
- **URL**: `/api/email/test`
- **Content-Type**: `application/json`

#### Request Body:

```json
{
  "email": "student@gmail.com",
  "name": "Aarav Sharma"
}
```

#### Success Response (`200 OK`):

```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

#### Validation Error Response (`400 Bad Request`):

```json
{
  "success": false,
  "requestId": "req-12345",
  "message": "Please provide a valid email address",
  "errorCode": "VALIDATION_ERROR",
  "timestamp": "2026-08-02T12:00:00.000Z"
}
```

---

## 🔄 How to Switch Email Providers in the Future

The architecture follows the **Dependency Inversion Principle** using the `IEmailProvider` interface.

To switch from Gmail SMTP to another provider (e.g., **Resend**, **AWS SES**, or **Brevo**):

### Step 1: Create a Provider Class implementing `IEmailProvider`

Example for **Resend**:

```typescript
// apps/api/src/services/resend-provider.ts
import { Resend } from "resend";
import { IEmailProvider, SendEmailOptions, EmailSendResult, maskEmail } from "./email.service.js";

export class ResendEmailProvider implements IEmailProvider {
  private resend: Resend;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  public async sendEmail(
    options: SendEmailOptions,
    templateName = "raw",
  ): Promise<EmailSendResult> {
    const startTime = Date.now();
    const recipientStr = Array.isArray(options.to) ? options.to.join(", ") : options.to;

    try {
      const response = await this.resend.emails.send({
        from: options.from || "StudentHub <noreply@studenthub.in>",
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      return {
        success: true,
        messageId: response.data?.id,
        recipient: recipientStr,
        templateName,
        durationMs: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        success: false,
        recipient: recipientStr,
        templateName,
        durationMs: Date.now() - startTime,
        error: err.message,
      };
    }
  }
}
```

### Step 2: Inject Provider into EmailService

```typescript
// Instantiating with Resend
import { ResendEmailProvider } from "./resend-provider.js";
import { EmailService } from "./email.service.js";

export const emailService = new EmailService(new ResendEmailProvider(process.env.RESEND_API_KEY!));
```

> **Zero Business Logic Changes**: Your business logic calls `emailService.sendWelcomeEmail()`, `emailService.sendForgotPasswordEmail()`, etc. without knowing which provider is sending the email underneath.
