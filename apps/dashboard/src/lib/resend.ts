export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
}

export interface SendEmailResult {
  id: string;
}

export interface NewsletterContent {
  subject: string;
  preheader?: string;
  sections: Array<{
    title: string;
    body: string;
    imageUrl?: string;
    ctaUrl?: string;
    ctaText?: string;
  }>;
}

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "events@fireflyevents.com";
const RESEND_BASE_URL = "https://api.resend.com";

export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const res = await fetch(`${RESEND_BASE_URL}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: options.from || RESEND_FROM_EMAIL,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      reply_to: options.replyTo,
      tags: options.tags,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<SendEmailResult>;
}

export function renderNewsletterHtml(content: NewsletterContent): string {
  const sectionsHtml = content.sections
    .map(
      (section) => `
      <tr>
        <td style="padding: 20px 30px;">
          ${section.imageUrl ? `<img src="${section.imageUrl}" alt="${section.title}" style="width: 100%; max-width: 560px; border-radius: 8px; margin-bottom: 16px;" />` : ""}
          <h2 style="margin: 0 0 12px; font-size: 20px; color: #1a1a1a;">${section.title}</h2>
          <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.5; color: #4a4a4a;">${section.body}</p>
          ${section.ctaUrl ? `<a href="${section.ctaUrl}" style="display: inline-block; padding: 10px 24px; background-color: #e85d04; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">${section.ctaText || "Learn More"}</a>` : ""}
        </td>
      </tr>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  ${content.preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${content.preheader}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 30px; background-color: #1a1a2e; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; color: #ffffff;">Firefly Events</h1>
            </td>
          </tr>
          ${sectionsHtml}
          <tr>
            <td style="padding: 20px 30px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; font-size: 12px; color: #9a9a9a;">Firefly Events &bull; Powered by FFE Social Engine</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
