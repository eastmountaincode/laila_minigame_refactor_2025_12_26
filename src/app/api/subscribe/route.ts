import { NextResponse } from "next/server";
import { appendRow, emailExists } from "@/lib/google-sheets";

const SPREADSHEET_ID = process.env.GOOGLE_EMAILS_SPREADSHEET_ID!;

// In-memory store for dev mode (resets on server restart)
const devModeEmails = new Set<string>();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // If Google Sheets is not configured, use in-memory store (for development)
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY || !process.env.GOOGLE_EMAILS_SPREADSHEET_ID) {
      const normalizedEmail = email.toLowerCase().trim();
      if (devModeEmails.has(normalizedEmail)) {
        return NextResponse.json({ success: true, message: "Already subscribed" });
      }
      devModeEmails.add(normalizedEmail);
      console.log("📧 Email subscription (dev mode):", email);
      return NextResponse.json({ success: true });
    }

    // Check if email already exists
    const exists = await emailExists(SPREADSHEET_ID, email);
    if (exists) {
      // Still return success - user doesn't need to know they were already subscribed
      return NextResponse.json({ success: true, message: "Already subscribed" });
    }

    // Append email to Google Sheet with timestamp
    const timestamp = new Date().toISOString();
    await appendRow(SPREADSHEET_ID, "Sheet1!A:B", [email, timestamp]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
