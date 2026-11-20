import nodemailer from 'nodemailer';
import env from '../config/env';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

let transporter: nodemailer.Transporter | null = null;

if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT || 587,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

export const sendMail = async (options: SendMailOptions): Promise<void> => {
  if (!transporter) {
    console.log('----------------------------------------------------');
    console.log('[mail.service] (SIMULATED - No SMTP configured)');
    console.log(`To: ${options.to}`);
    console.log(`From: ${env.MAIL_FROM}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Content:\n${options.text || options.html}`);
    console.log('----------------------------------------------------');
    return;
  }

  try {
    await transporter.sendMail({
      from: env.MAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  } catch (error) {
    console.error('[mail.service] Failed to send email via SMTP:', error);
  }
};

export const sendInquiryNotificationToOwner = async (inquiry: {
  name: string;
  email: string;
  phone?: string;
  serviceType?: string;
  eventDate?: Date;
  location?: string;
  message: string;
}): Promise<void> => {
  const recipient = env.ADMIN_EMAIL;
  const subject = `[New Inquiry] ${inquiry.serviceType || 'General'} - ${inquiry.name}`;
  const html = `
    <h2>New Client Inquiry Received</h2>
    <p><strong>Name:</strong> ${inquiry.name}</p>
    <p><strong>Email:</strong> ${inquiry.email}</p>
    <p><strong>Phone:</strong> ${inquiry.phone || 'N/A'}</p>
    <p><strong>Service Type:</strong> ${inquiry.serviceType || 'General'}</p>
    <p><strong>Event Date:</strong> ${inquiry.eventDate ? new Date(inquiry.eventDate).toLocaleDateString() : 'N/A'}</p>
    <p><strong>Location:</strong> ${inquiry.location || 'N/A'}</p>
    <p><strong>Message:</strong></p>
    <blockquote style="background:#f4f4f4;padding:12px;border-left:4px solid #333;">
      ${inquiry.message.replace(/\n/g, '<br/>')}
    </blockquote>
  `;

  await sendMail({ to: recipient, subject, html });
};

export const sendInquiryConfirmationToClient = async (inquiry: {
  name: string;
  email: string;
}): Promise<void> => {
  const subject = `Thank you for contacting us, ${inquiry.name}!`;
  const html = `
    <h2>Hello ${inquiry.name},</h2>
    <p>Thank you for reaching out! We have received your inquiry and will review your request shortly.</p>
    <p>We typically respond within 24-48 business hours with availability, package details, and initial suggestions.</p>
    <br/>
    <p>Warm regards,<br/>Photography Studio</p>
  `;

  await sendMail({ to: inquiry.email, subject, html });
};
