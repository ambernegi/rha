import { google } from "googleapis";

type SendEmailArgs = {
  to: string;
  subject: string;
  text: string;
};

function base64UrlEncode(input: string) {
  return Buffer.from(input, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

/**
 * Send email via Gmail API.
 *
 * Vercel note: Gmail SMTP is commonly blocked on serverless, but Gmail API (HTTPS) works.
 *
 * Required env vars:
 * - GMAIL_CLIENT_ID
 * - GMAIL_CLIENT_SECRET
 * - GMAIL_REFRESH_TOKEN
 * - GMAIL_SENDER_EMAIL (the Gmail address that sends the email)
 */
export async function sendEmailViaGmailApi(args: SendEmailArgs) {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const sender = process.env.GMAIL_SENDER_EMAIL;

  if (!clientId || !clientSecret || !refreshToken || !sender) {
    return {
      ok: false as const,
      error:
        "Missing Gmail env vars (GMAIL_CLIENT_ID/GMAIL_CLIENT_SECRET/GMAIL_REFRESH_TOKEN/GMAIL_SENDER_EMAIL)",
    };
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  // SECURITY: Do not place untrusted input in headers. Only `to` and `subject` are used here.
  // If you later allow arbitrary "to"/"subject" from user input, validate/sanitize to prevent header injection.
  const raw = [
    `From: ${sender}`,
    `To: ${args.to}`,
    `Subject: ${args.subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "",
    args.text,
  ].join("\r\n");

  try {
    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: base64UrlEncode(raw) },
    });

    return { ok: true as const };
  } catch {
    // Don't leak provider error details into logs (may include metadata).
    return { ok: false as const, error: "Failed to send email" };
  }
}


