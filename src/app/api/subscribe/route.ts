import { NextResponse } from "next/server";
import { appendRow, emailPathwayExists } from "@/lib/google-sheets";
import { isPathway } from "@/lib/pathways";

const SPREADSHEET_ID = process.env.GOOGLE_EMAILS_SPREADSHEET_ID!;

// In-memory store for dev mode (resets on server restart)
const devModeEmails = new Set<string>();

export async function POST(request: Request) {
  try {
    const { email, pathway } = await request.json();

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

    if (!isPathway(pathway)) {
      return NextResponse.json(
        { error: "Valid pathway is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const subscriptionKey = `${normalizedEmail}:${pathway}`;
    let alreadySubscribed = false;

    // If Google Sheets is not configured, use in-memory store (for development)
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY || !process.env.GOOGLE_EMAILS_SPREADSHEET_ID) {
      if (devModeEmails.has(subscriptionKey)) {
        alreadySubscribed = true;
      } else {
        devModeEmails.add(subscriptionKey);
        console.log("Email subscription (dev mode):", normalizedEmail, pathway);
      }
    } else {
      // Check if this email already exists for this pathway.
      alreadySubscribed = await emailPathwayExists(SPREADSHEET_ID, normalizedEmail, pathway);

      if (!alreadySubscribed) {
        // Append email, pathway, and timestamp.
        const timestamp = new Date().toISOString();
        await appendRow(SPREADSHEET_ID, "Sheet1!A:C", [normalizedEmail, pathway, timestamp]);
      }
    }

    return NextResponse.json({
      success: true,
      message: alreadySubscribed ? "Already subscribed" : undefined,
    });
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
