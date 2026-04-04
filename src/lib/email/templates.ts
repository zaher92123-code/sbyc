import type { ActiveSessionView } from "@/types";
import { formatDate, formatOMR, daysOverdue, daysUntil } from "@/lib/utils";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Al Seeb Boat Club";
const BRAND_COLOR = "#0E7490";

function baseLayout(content: string, subject: string): string {
  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; background: #f8fafc; font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 24px 16px; }
    .card { background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #0A1628 0%, #0E7490 100%); padding: 32px 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 22px; font-weight: 700; margin: 0 0 4px; }
    .header p { color: #94d5e8; font-size: 13px; margin: 0; }
    .body { padding: 32px; }
    .greeting { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
    .info-box { background: #f0fdfc; border: 1px solid #99f6f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #64748b; font-weight: 500; }
    .info-value { font-weight: 600; color: #0f172a; text-align: right; }
    .alert-box { border-radius: 8px; padding: 16px 20px; margin: 20px 0; font-size: 14px; font-weight: 600; }
    .alert-warning { background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412; }
    .alert-danger { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
    .alert-info { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; }
    .btn { display: inline-block; padding: 12px 28px; background: ${BRAND_COLOR}; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px; margin: 16px 0; }
    .footer { text-align: center; padding: 24px 32px; color: #94a3b8; font-size: 12px; }
    .balance { font-size: 24px; font-weight: 800; color: #dc2626; text-align: center; margin: 12px 0; }
    .amount-paid { font-size: 18px; font-weight: 700; color: #059669; text-align: center; margin: 8px 0; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <h1>⚓ ${APP_NAME}</h1>
        <p>Al Seeb Boat Club, Muscat, Sultanate of Oman</p>
      </div>
      <div class="body">
        ${content}
      </div>
      <div class="footer">
        <p>This is an automated message from ${APP_NAME}.</p>
        <p>Al Seeb Boat Club · Muscat, Oman · info@alseebboatclub.om</p>
        <p style="color:#cbd5e1; font-size:11px;">Please do not reply to this email. For assistance, contact the marina office.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

function sessionInfoBox(session: ActiveSessionView): string {
  const remaining = daysUntil(session.expected_end_date);
  return `
    <div class="info-box">
      <div class="info-row">
        <span class="info-label">Vessel</span>
        <span class="info-value">${session.boat_name}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Registration</span>
        <span class="info-value">${session.registration_number}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Spot</span>
        <span class="info-value">${session.spot_number} — ${session.pier_section || ""}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Check-In</span>
        <span class="info-value">${formatDate(session.start_date)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Expected Departure</span>
        <span class="info-value">${formatDate(session.expected_end_date)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Total Charges</span>
        <span class="info-value">${formatOMR(session.total_due)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Amount Paid</span>
        <span class="info-value" style="color:#059669">${formatOMR(session.total_paid)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Balance Due</span>
        <span class="info-value" style="color:${session.remaining_balance > 0 ? "#dc2626" : "#059669"}">${formatOMR(session.remaining_balance)}</span>
      </div>
    </div>
  `;
}

// =============================================================================
// Customer Templates
// =============================================================================

export function reminderTemplate(
  session: ActiveSessionView,
  daysLabel: string,
  isUrgent = false
): { subject: string; html: string } {
  const remaining = daysUntil(session.expected_end_date);
  const subject = `[${APP_NAME}] Parking Reminder: ${session.boat_name} — ${daysLabel}`;

  const alertClass = isUrgent ? "alert-danger" : remaining <= 7 ? "alert-warning" : "alert-info";
  const alertText =
    remaining > 0
      ? `Your vessel's parking period ends in <strong>${remaining} day${remaining !== 1 ? "s" : ""}</strong> on ${formatDate(session.expected_end_date)}.`
      : remaining === 0
      ? "Your vessel's parking period <strong>expires today</strong>. Please settle your account."
      : "";

  const html = baseLayout(
    `
    <p class="greeting">Dear ${session.owner_name || "Valued Customer"},</p>
    <p>This is a reminder regarding your vessel currently berthed at ${APP_NAME}.</p>

    <div class="alert-box ${alertClass}">
      ${alertText}
    </div>

    ${sessionInfoBox(session)}

    ${
      session.remaining_balance > 0
        ? `
      <hr/>
      <p style="font-weight:600;color:#1e293b;">Outstanding Balance</p>
      <div class="balance">${formatOMR(session.remaining_balance)}</div>
      <p style="text-align:center;color:#64748b;font-size:14px;">Please visit the marina office or contact us to settle your account.</p>
    `
        : `<p style="text-align:center;color:#059669;font-weight:600;">Your account is fully settled. Thank you!</p>`
    }

    <p style="margin-top:24px;">If you wish to extend your parking period, please visit the marina office at least 3 days before your departure date.</p>

    <p>Thank you for choosing ${APP_NAME}.</p>
    <p style="color:#64748b;font-size:14px;">Tel: Marina Office: +968 2200 0000</p>
  `,
    subject
  );

  return { subject, html };
}

export function overdueTemplate(session: ActiveSessionView): { subject: string; html: string } {
  const overdue = daysOverdue(session.expected_end_date);
  const subject = `[URGENT] ${APP_NAME}: Overdue Parking — ${session.boat_name}`;

  const html = baseLayout(
    `
    <p class="greeting">Dear ${session.owner_name || "Valued Customer"},</p>

    <div class="alert-box alert-danger">
      URGENT: Your vessel's parking period expired <strong>${overdue} day${overdue !== 1 ? "s" : ""} ago</strong> on ${formatDate(session.expected_end_date)}.
    </div>

    ${sessionInfoBox(session)}

    <div style="background:#fef2f2;border-radius:8px;padding:20px;margin:20px 0;text-align:center;">
      <p style="color:#991b1b;font-weight:700;font-size:16px;margin:0 0 8px;">Overdue Balance</p>
      <div class="balance">${formatOMR(session.remaining_balance)}</div>
      <p style="color:#64748b;font-size:13px;margin:8px 0 0;">Additional charges may apply for extended stays.</p>
    </div>

    <p>Please contact the marina office <strong>immediately</strong> to resolve your account. Failure to do so may result in additional charges and restrictions.</p>

    <p>Tel: Marina Office: +968 2200 0000</p>
    <p>Email: info@alseebboatclub.om</p>
  `,
    subject
  );

  return { subject, html };
}

// =============================================================================
// Staff Templates
// =============================================================================

export function staffAlertTemplate(
  session: ActiveSessionView,
  alertType: "ending_soon" | "overdue" | "unpaid" | "reminder_failed",
  extra?: string
): { subject: string; html: string } {
  const labels: Record<string, string> = {
    ending_soon: "Session Ending Soon",
    overdue: "Overdue Session Alert",
    unpaid: "Unpaid Balance Alert",
    reminder_failed: "Reminder Delivery Failed",
  };

  const subject = `[Staff Alert] ${APP_NAME}: ${labels[alertType]} — ${session.boat_name}`;

  const alertStyles: Record<string, string> = {
    ending_soon: "alert-warning",
    overdue: "alert-danger",
    unpaid: "alert-danger",
    reminder_failed: "alert-info",
  };

  const alertMessages: Record<string, string> = {
    ending_soon: `Vessel <strong>${session.boat_name}</strong> (${session.registration_number}) is ending its parking session in <strong>${daysUntil(session.expected_end_date)} days</strong>.`,
    overdue: `Vessel <strong>${session.boat_name}</strong> (${session.registration_number}) is <strong>${daysOverdue(session.expected_end_date)} days overdue</strong>. Immediate action required.`,
    unpaid: `Vessel <strong>${session.boat_name}</strong> has an outstanding balance of <strong>${formatOMR(session.remaining_balance)}</strong>.`,
    reminder_failed: `Reminder delivery failed for ${session.boat_name}. ${extra || ""}`,
  };

  const html = baseLayout(
    `
    <p class="greeting">Staff Notification</p>

    <div class="alert-box ${alertStyles[alertType]}">
      ${alertMessages[alertType]}
    </div>

    ${sessionInfoBox(session)}

    <hr/>
    <p style="color:#64748b;font-size:13px;">
      <strong>Owner Contact:</strong> ${session.owner_name || "—"} · 
      ${session.owner_phone || "—"} · 
      ${session.owner_email || "—"}
    </p>
    <p style="color:#94a3b8;font-size:12px;">Log in to the marina management system to take action.</p>
  `,
    subject
  );

  return { subject, html };
}

export function getEmailTemplate(
  templateKey: string,
  session: ActiveSessionView,
  recipientType: "customer" | "staff"
): { subject: string; html: string } {
  if (recipientType === "staff") {
    const alertType =
      session.status === "overdue"
        ? "overdue"
        : session.status === "ending_soon"
        ? "ending_soon"
        : "unpaid";
    return staffAlertTemplate(session, alertType);
  }

  const daysMap: Record<string, string> = {
    reminder_30d: "30 Days Notice",
    reminder_20d: "20 Days Notice",
    reminder_10d: "10 Days Notice",
    reminder_7d: "7 Days Notice",
    reminder_3d: "3 Days Notice",
    reminder_1d: "Final Reminder — 1 Day",
    reminder_due: "Departure Day",
    reminder_overdue: "OVERDUE",
  };

  if (templateKey === "reminder_overdue") {
    return overdueTemplate(session);
  }

  return reminderTemplate(session, daysMap[templateKey] || templateKey, templateKey === "reminder_1d");
}


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
