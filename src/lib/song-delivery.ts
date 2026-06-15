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

export async function sendPathwaySongEmail(email: string, pathway: Pathway) {
  const song = SONGS_BY_PATHWAY[pathway];
  const filePath = path.join(process.cwd(), "private", "email-songs", song.filename);
  const attachment = await readFile(filePath);

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
    subject: "Your song from Something Dreadful's Gonna Happen",
    html: `
      <div>
        <p>Thank you for playing.</p>
        <p>Your song is attached: <strong>${song.title}</strong>.</p>
      </div>
    `,
    text: `Thank you for playing.\n\nYour song is attached: ${song.title}.`,
    attachments: [
      {
        filename: song.attachmentName,
        content: attachment,
        contentType: "audio/mpeg",
      },
    ],
  });
}
