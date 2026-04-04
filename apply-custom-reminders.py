#!/usr/bin/env python3
"""
Adds placeholder replacement for custom reminder messages.
Run from project root: python3 apply-custom-reminders.py
"""
import os

ROOT = os.getcwd()
SRC  = os.path.join(ROOT, "src")

def write(path, content):
    full = os.path.join(SRC, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w") as f:
        f.write(content)
    print(f"  ✓ src/{path}")

print("\n🔧 Wiring up custom reminder message placeholders...\n")

# ── 1. Placeholder replacement utility ───────────────────────────────────────
print("1️⃣  Writing placeholder utility...")
write("lib/email/placeholders.ts", r'''import type { ActiveSessionView } from "@/types";
import { formatDate, formatOMR, daysUntil } from "@/lib/utils";

/**
 * Replaces [Placeholder] tokens in a custom message with real session data.
 *
 * Supported placeholders:
 *   [Owner Name]      → full name of the primary owner
 *   [Boat Name]       → vessel name
 *   [Boat Type]       → vessel type
 *   [Spot Number]     → parking spot number
 *   [Registration]    → registration number
 *   [Entry Date]      → session start date
 *   [Expiry Date]     → expected end date
 *   [Days Remaining]  → days until expiry (negative if overdue)
 *   [Balance Due]     → outstanding balance in OMR
 *   [Total Due]       → total amount due in OMR
 *   [Total Paid]      → total amount paid in OMR
 *   [Marina Name]     → marina name from env
 */
export function replacePlaceholders(
  text: string,
  session: ActiveSessionView
): string {
  const days = daysUntil(session.expected_end_date);
  const marinaName = process.env.NEXT_PUBLIC_APP_NAME || "Al Seeb Bay Marina";

  const map: Record<string, string> = {
    "[Owner Name]":     session.owner_name      || "Valued Customer",
    "[Boat Name]":      session.boat_name        || "Your Vessel",
    "[Boat Type]":      (session as any).boat_type || "",
    "[Spot Number]":    session.spot_number      || "",
    "[Registration]":   session.registration_number || "",
    "[Entry Date]":     formatDate(session.start_date),
    "[Expiry Date]":    formatDate(session.expected_end_date),
    "[Days Remaining]": days !== null
      ? days >= 0
        ? `${days} day${days !== 1 ? "s" : ""}`
        : `${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} overdue`
      : "",
    "[Balance Due]":    formatOMR(session.remaining_balance),
    "[Total Due]":      formatOMR(session.total_due),
    "[Total Paid]":     formatOMR(session.total_paid),
    "[Marina Name]":    marinaName,
  };

  let result = text;
  for (const [token, value] of Object.entries(map)) {
    // Replace all occurrences, case-insensitive
    result = result.replace(new RegExp(token.replace(/[[\]]/g, "\\$&"), "gi"), value);
  }
  return result;
}
''')

# ── 2. Update cron route to use custom subject + message ─────────────────────
print("2️⃣  Updating cron reminder route...")

cron_path = os.path.join(SRC, "app/api/cron/reminders/route.ts")
with open(cron_path) as f:
    cron = f.read()

# Add import for replacePlaceholders
cron = cron.replace(
    'import { getEmailTemplate } from "@/lib/email/templates";',
    'import { getEmailTemplate, buildCustomEmail } from "@/lib/email/templates";\nimport { replacePlaceholders } from "@/lib/email/placeholders";'
)

# Replace the template lookup to also handle custom messages
old_template_block = '''    const templateKey = reminder.rule?.template_key || reminder.reminder_type;
    const { subject, html } = getEmailTemplate(templateKey, session, reminder.recipient_type);'''

new_template_block = '''    // Use custom subject/message from rule if provided, otherwise fall back to template
    const rule = reminder.rule as any;
    let subject: string;
    let html: string;

    if (rule?.custom_message && rule.custom_message.trim()) {
      // Replace placeholders with real session data
      const customSubject = rule.custom_subject?.trim()
        ? replacePlaceholders(rule.custom_subject, session)
        : `Reminder: ${session.boat_name} — Al Seeb Bay Marina`;
      const customBody = replacePlaceholders(rule.custom_message, session);
      ({ subject, html } = buildCustomEmail(customSubject, customBody, session));
    } else {
      const templateKey = rule?.template_key || reminder.reminder_type;
      ({ subject, html } = getEmailTemplate(templateKey, session, reminder.recipient_type));
    }'''

cron = cron.replace(old_template_block, new_template_block)

with open(cron_path, "w") as f:
    f.write(cron)
print("  ✓ src/app/api/cron/reminders/route.ts")

# ── 3. Add buildCustomEmail to templates.ts ───────────────────────────────────
print("3️⃣  Adding buildCustomEmail to templates.ts...")

templates_path = os.path.join(SRC, "lib/email/templates.ts")
with open(templates_path) as f:
    templates = f.read()

# Add the buildCustomEmail function at the end if not already there
if "buildCustomEmail" not in templates:
    templates += r'''

// ── Custom message email ──────────────────────────────────────────────────────
// Used when a reminder rule has a custom_message set.
// The message has already had placeholders replaced before this is called.
export function buildCustomEmail(
  subject: string,
  customMessage: string,
  session: ActiveSessionView
): { subject: string; html: string } {
  // Convert line breaks to <br> for HTML
  const htmlMessage = customMessage
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");

  const content = `
    <p class="greeting">Dear ${session.owner_name || "Valued Customer"},</p>
    <div style="margin: 16px 0; font-size: 15px; line-height: 1.7; color: #334155;">
      ${htmlMessage}
    </div>
    ${sessionInfoBox(session)}
  `;
  return { subject, html: baseLayout(content, subject) };
}
'''
    with open(templates_path, "w") as f:
        f.write(templates)
    print("  ✓ src/lib/email/templates.ts")
else:
    print("  ~ src/lib/email/templates.ts (already has buildCustomEmail)")

print("\n✅  Done!")
print()
print("   How placeholders work:")
print("   When you write a custom message in a reminder rule, you can use:")
print("     [Owner Name]     → replaced with the owner's full name")
print("     [Boat Name]      → replaced with the vessel name")
print("     [Spot Number]    → replaced with the parking spot number")
print("     [Expiry Date]    → replaced with the session expiry date")
print("     [Days Remaining] → replaced with days left (or overdue)")
print("     [Balance Due]    → replaced with the outstanding balance in OMR")
print("     [Entry Date]     → replaced with the session start date")
print("     [Registration]   → replaced with the boat registration number")
print()
print("   Example message:")
print("     Dear [Owner Name],")
print("     Your boat [Boat Name] stored at spot [Spot Number] expires on [Expiry Date].")
print("     Outstanding balance: [Balance Due].")
print("     Please contact us to renew.")
