import { readFile } from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";
import type { Pathway } from "@/lib/pathways";

type SongDelivery = {
  title: string;
  filename: string;
  attachmentName: string;
};

const SONGS_BY_PATHWAY: Record<Pathway, SongDelivery> = {
  denial: {
    title: "I Don't Think of You",
    filename: "i-dont-think-of-you.mp3",
    attachmentName: "I Don't Think of You.mp3",
  },
  bargaining: {
    title: "I'll Do Anything",
    filename: "ill-do-anything.mp3",
    attachmentName: "I'll Do Anything.mp3",
  },
  anger: {
    title: "I Needed You to Know",
    filename: "i-needed-you-to-know.mp3",
    attachmentName: "I Needed You to Know.mp3",
  },
  tender: {
    title: "The Heat Goes Down",
    filename: "the-heat-goes-down.mp3",
    attachmentName: "The Heat Goes Down.mp3",
  },
};

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

function smtpSecure() {
  return process.env.SMTP_SECURE !== "false";
}

function smtpPassword() {
  return requiredEnv("SMTP_PASSWORD").replace(/\s+/g, "");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendPathwaySongEmail(email: string, pathway: Pathway) {
  const song = SONGS_BY_PATHWAY[pathway];
  const filePath = path.join(process.cwd(), "private", "email-songs", song.filename);
  const rosePath = path.join(process.cwd(), "private", "email-assets", "rose.txt");
  const [attachment, roseAscii] = await Promise.all([
    readFile(filePath),
    readFile(rosePath, "utf8"),
  ]);
  const escapedRoseAscii = escapeHtml(roseAscii);
  const escapedPathway = escapeHtml(pathway);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: smtpSecure(),
    auth: {
      user: requiredEnv("SMTP_USER"),
      pass: smtpPassword(),
    },
  });

  return transporter.sendMail({
    from: requiredEnv("SMTP_FROM_EMAIL"),
    to: email,
    replyTo: process.env.SMTP_REPLY_TO,
    subject: "I HAVE A GIFT FOR YOU",
    html: `
      <div style="font-family: Georgia, 'Times New Roman', serif; font-size: 16px; line-height: 1.45; color: #111;">
        <p>For some reason that only you can say, you chose ${escapedPathway}.</p>
        <p>I want to share something with you, as a thank you for playing. I hope you felt something.</p>
        <p>Find the attached (and perhaps feel something more).</p>
        <pre style="font-family: 'Courier New', monospace; font-size: 12px; line-height: 1; white-space: pre; color: #111; margin: 20px 0;">${escapedRoseAscii}</pre>
        <p>~~ website made with love by Laila Smith and Andrew Boylan</p>
      </div>
    `,
    text: `For some reason that only you can say, you chose ${pathway}.\n\nI want to share something with you, as a thank you for playing. I hope you felt something.\n\nFind the attached (and perhaps feel something more).\n\n${roseAscii}\n\n~~ website made with love by Laila Smith and Andrew Boylan`,
    attachments: [
      {
        filename: song.attachmentName,
        content: attachment,
        contentType: "audio/mpeg",
      },
    ],
  });
}
