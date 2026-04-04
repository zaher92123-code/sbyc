import type { ActiveSessionView } from "@/types";
import { formatDate, formatOMR, daysUntil } from "@/lib/utils";

export function replacePlaceholders(text: string, session: ActiveSessionView): string {
  const days = daysUntil(session.expected_end_date);
  const marina = process.env.NEXT_PUBLIC_APP_NAME || "Al Seeb Boat Club";

  const map: Record<string, string> = {
    "[Owner Name]":     session.owner_name      || "Valued Customer",
    "[Boat Name]":      session.boat_name        || "Your Vessel",
    "[Spot Number]":    session.spot_number      || "",
    "[Registration]":   session.registration_number || "",
    "[Entry Date]":     formatDate(session.start_date),
    "[Expiry Date]":    formatDate(session.expected_end_date),
    "[Days Remaining]": days !== null
      ? days >= 0 ? `${days} day${days !== 1 ? "s" : ""}`
                 : `${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} overdue`
      : "",
    "[Balance Due]":  formatOMR(session.remaining_balance),
    "[Total Due]":    formatOMR(session.total_due),
    "[Total Paid]":   formatOMR(session.total_paid),
    "[Marina Name]":  marina,
  };

  let result = text;
  for (const [token, value] of Object.entries(map)) {
    result = result.replace(new RegExp(token.replace(/[[\]]/g, "\\$&"), "gi"), value);
  }
  return result;
}
