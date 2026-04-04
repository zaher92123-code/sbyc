import { getAppSettings } from "@/lib/appSettings";

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<SendEmailResult> {
  const settings = await getAppSettings();
  const apiKey = settings.email_resend_api_key || process.env.RESEND_API_KEY;
  const fromName = settings.email_from_name || process.env.RESEND_FROM_NAME || "Al Seeb Boat Club";
  const fromEmail = settings.email_from_address || process.env.RESEND_FROM_EMAIL || "noreply@alseebbay.om";

  if (!apiKey) {
    return { success: false, error: "Email not configured. Set Resend API key in Settings." };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${fromName} <${fromEmail}>`,
        to: Array.isArray(opts.to) ? opts.to : [opts.to],
        subject: opts.subject,
        html: opts.html,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      return { success: false, error: result.message || JSON.stringify(result) };
    }

    return { success: true, messageId: result.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function sendBulkEmails(
  emails: SendEmailOptions[]
): Promise<SendEmailResult[]> {
  const results = await Promise.allSettled(emails.map(sendEmail));
  return results.map((r) =>
    r.status === "fulfilled" ? r.value : { success: false, error: "Promise rejected" }
  );
}
