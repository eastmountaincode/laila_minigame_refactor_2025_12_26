import { readFile } from "node:fs/promises";
import path from "node:path";
import { Resend } from "resend";
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

export async function sendPathwaySongEmail(email: string, pathway: Pathway) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!process.env.RESEND_FROM_EMAIL) {
    throw new Error("RESEND_FROM_EMAIL is not configured");
  }

  const song = SONGS_BY_PATHWAY[pathway];
  const resend = new Resend(process.env.RESEND_API_KEY);
  const filePath = path.join(process.cwd(), "private", "email-songs", song.filename);
  const attachment = await readFile(filePath);

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: [email],
    replyTo: process.env.RESEND_REPLY_TO,
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
      },
    ],
  });

  if (error) {
    throw new Error(`Resend failed: ${error.message}`);
  }

  return data;
}
