import { NextResponse } from "next/server";
import { deleteEmail } from "@/lib/google-sheets";

const SPREADSHEET_ID = process.env.GOOGLE_EMAILS_SPREADSHEET_ID!;

// Only available in development/test
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY || !process.env.GOOGLE_EMAILS_SPREADSHEET_ID) {
      // In dev mode without credentials, just succeed
      return NextResponse.json({ success: true, message: "Dev mode - no cleanup needed" });
    }

    const deleted = await deleteEmail(SPREADSHEET_ID, email);
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json({ error: "Failed to cleanup" }, { status: 500 });
  }
}
