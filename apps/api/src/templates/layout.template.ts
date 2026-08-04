export interface EmailLayoutOptions {
  title: string;
  previewText?: string;
  contentHtml: string;
}

/**
 * Base Responsive HTML Email Layout for StudentHub.
 * Features StudentHub brand gradient header, clean typography, responsive layout, and footer.
 */
export function renderEmailLayout(options: EmailLayoutOptions): string {
  const currentYear = new Date().getFullYear();
  const supportEmail = "support@studenthub.in";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${escapeHtml(options.title)}</title>
  <style type="text/css">
    /* Client-specific Resets */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f4f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }

    /* Mobile Responsive Styles */
    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; margin: auto !important; }
      .fluid { max-width: 100% !important; height: auto !important; margin-left: auto !important; margin-right: auto !important; }
      .stack-column, .stack-column-center { display: block !important; width: 100% !important; max-width: 100% !important; direction: ltr !important; }
      .padding-mobile { padding: 20px 16px !important; }
      .btn-primary { width: 100% !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8;">
  ${
    options.previewText
      ? `<div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">${escapeHtml(options.previewText)}</div>`
      : ""
  }
  
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6f8; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 24px 8px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Header with StudentHub Branding -->
          <tr>
            <td align="center" style="padding: 32px 24px; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #8b5cf6 100%);">
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <!-- Brand Logo Placeholder -->
                    <div style="display: inline-flex; align-items: center; justify-content: center; background-color: rgba(255, 255, 255, 0.2); padding: 8px 16px; border-radius: 9999px; backdrop-filter: blur(4px);">
                      <span style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; font-family: sans-serif;">
                        Student<span style="color: #fbbf24;">Hub</span>
                      </span>
                    </div>
                    <p style="margin: 8px 0 0 0; font-size: 12px; color: #e0e7ff; letter-spacing: 0.5px; font-weight: 500;">
                      INDORE'S #1 STUDENT MARKETPLACE
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Body Content -->
          <tr>
            <td class="padding-mobile" style="padding: 32px 32px; background-color: #ffffff;">
              ${options.contentHtml}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 32px;">
              <div style="border-top: 1px solid #f1f5f9; width: 100%;"></div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px 32px 32px; background-color: #ffffff; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                Need help or have questions? Contact our support team at<br>
                <a href="mailto:${supportEmail}" style="color: #4f46e5; text-decoration: none; font-weight: 600;">${supportEmail}</a>
              </p>
              <p style="margin: 16px 0 0 0; font-size: 12px; color: #94a3b8;">
                &copy; ${currentYear} StudentHub Technologies Pvt Ltd. Indore, Madhya Pradesh, India.
              </p>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #cbd5e1;">
                This is an automated operational notification regarding your StudentHub account.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
