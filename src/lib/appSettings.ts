import { createClient } from "@/lib/supabase/server";

// Get all settings as a key-value map
export async function getAppSettings(): Promise<Record<string, string>> {
  const supabase = await createClient();
  const { data } = await supabase.from("app_settings").select("key, value");
  const settings: Record<string, string> = {};
  data?.forEach(s => { if (s.value) settings[s.key] = s.value; });
  return settings;
}

// Get a single setting
export async function getSetting(key: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("app_settings").select("value").eq("key", key).single();
  return data?.value || null;
}

// Send WhatsApp message via Meta Cloud API
// Tries template message first (required for business-initiated conversations)
// Falls back to text message (works within 24h customer service window)
export async function sendWhatsApp(
  phone: string,
  message: string,
  templateName?: string,
  templateLanguage?: string,
): Promise<{ success: boolean; error?: string }> {
  const settings = await getAppSettings();
  const phoneNumberId = settings.whatsapp_phone_number_id;
  const accessToken = settings.whatsapp_access_token;
  const apiVersion = settings.whatsapp_api_version || "v21.0";

  if (!phoneNumberId || !accessToken) {
    return { success: false, error: "WhatsApp not configured. Set credentials in Settings." };
  }

  const cleanPhone = phone.replace(/[\s\-\+]/g, "").replace(/^00/, "");

  // Build message payload
  let payload: Record<string, unknown>;

  if (templateName) {
    // Template message — works for business-initiated conversations
    payload = {
      messaging_product: "whatsapp",
      to: cleanPhone,
      type: "template",
      template: {
        name: templateName,
        language: { code: templateLanguage || "en" },
        // For templates with body parameters, pass the message as component
        components: message ? [
          {
            type: "body",
            parameters: [{ type: "text", text: message }],
          },
        ] : undefined,
      },
    };
  } else {
    // Text message — only works within 24h customer service window
    payload = {
      messaging_product: "whatsapp",
      to: cleanPhone,
      type: "text",
      text: { body: message },
    };
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await res.json();

    if (!res.ok) {
      const errMsg = result.error?.message || JSON.stringify(result);

      // If template fails, provide helpful error
      if (errMsg.includes("template") || result.error?.code === 132000) {
        return {
          success: false,
          error: `Template "${templateName}" not found or not approved. Create and approve it in Meta Business Manager first. Original error: ${errMsg}`,
        };
      }

      return { success: false, error: errMsg };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error" };
  }
}

// Send Email via Resend
export async function sendEmail(
  to: string,
  subject: string,
  htmlBody: string
): Promise<{ success: boolean; error?: string }> {
  const settings = await getAppSettings();
  const apiKey = settings.email_resend_api_key;
  const fromName = settings.email_from_name || "Al Seeb Boat Club";
  const fromEmail = settings.email_from_address || "noreply@alseebbay.om";

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
        to: [to],
        subject,
        html: htmlBody,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      return { success: false, error: result.message || JSON.stringify(result) };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Network error" };
  }
}
