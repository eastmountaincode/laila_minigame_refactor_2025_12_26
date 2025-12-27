import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // If RESEND_API_KEY is not set, just log and succeed (for development)
    if (!process.env.RESEND_API_KEY) {
      console.log("📧 Email subscription (dev mode):", email);
      return NextResponse.json({ success: true, message: "Subscribed (dev mode)" });
    }

    // Add contact to Resend audience or send a welcome email
    // Option 1: Add to an audience (requires audience ID)
    // await resend.contacts.create({
    //   email,
    //   audienceId: process.env.RESEND_AUDIENCE_ID!,
    // });

    // Option 2: Send a welcome/confirmation email
    await resend.emails.send({
      from: "onboarding@resend.dev", // Replace with your verified domain
      to: email,
      subject: "You chose denial",
      html: `
        <h1>Welcome, cartographer of your inner world</h1>
        <p>Thank you for choosing denial.</p>
        <p>You have begun your journey.</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscription error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
