import "server-only";
import nodemailer from "nodemailer";

type AuthMail = {
  to: string;
  subject: string;
  link: string;
  description: string;
};

export function isAuthMailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD &&
    process.env.SMTP_FROM,
  );
}

export async function sendAuthMail({ to, subject, link, description }: AuthMail) {
  if (!isAuthMailConfigured()) {
    throw new Error("SMTP mail transport is not configured");
  }
  const port = Number(process.env.SMTP_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Invalid SMTP_PORT");
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port,
    secure: process.env.SMTP_SECURE === "true",
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASSWORD! },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM!,
    to,
    subject,
    text: `${description}\n\n${link}\n\nЕсли вы не запрашивали это действие, просто проигнорируйте письмо.`,
  });
}
