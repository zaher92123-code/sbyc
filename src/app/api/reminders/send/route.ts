import { NextRequest, NextResponse } from "next/server";

// Redirect POST from dashboard "Send Pending Now" button to cron handler
export async function POST(_request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/cron/reminders`, {
    method: "GET",
    headers: {
      "x-cron-secret": process.env.CRON_SECRET || "",
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function GET(_request: NextRequest) {
  return NextResponse.json({ message: "Use POST to trigger reminder send" });
}
