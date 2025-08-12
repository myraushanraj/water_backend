import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter;

export function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: env.smtpUser && env.smtpPass ? { user: env.smtpUser, pass: env.smtpPass } : undefined,
  });
  return transporter;
}

export async function sendEmail({ to, subject, html, text }) {
  if (!env.smtpHost) {
    console.warn('SMTP not configured. Skipping email send to', to);
    return;
  }
  const mailOptions = {
    from: env.fromEmail,
    to,
    subject,
    text,
    html,
  };
  const tx = await getTransporter().sendMail(mailOptions);
  return tx;
} 