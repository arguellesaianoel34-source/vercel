import nodemailer from "nodemailer";
import { siteContentRepo } from "@workspace/db";
import { pino } from "pino";

const logger = pino();

export async function getTransporter() {
  const content = await siteContentRepo.get("smtp");
  if (!content) {
    throw new Error("SMTP configuration not found in database");
  }

  const { smtpHost, smtpPort, smtpUser, smtpPassword } = content.content as any;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
    throw new Error("Incomplete SMTP configuration");
  }

  return nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort),
    secure: smtpPort === "465",
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });
}

export async function sendContactNotification(contact: {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service?: string | null;
  message: string;
}) {
  try {
    const transporter = await getTransporter();
    const content = await siteContentRepo.get("smtp");
    const { fromEmail, fromName } = (content?.content || {}) as any;

    const mailOptions = {
      from: `"${fromName || "VibeAlong"}" <${fromEmail || "no-reply@vibeglobally.ph"}>`,
      to: fromEmail || "vibegloballyteam@gmail.com",
      subject: `New Contact Inquiry: ${contact.name}`,
      text: `
        New contact inquiry received:
        
        Name: ${contact.name}
        Email: ${contact.email}
        Phone: ${contact.phone || "N/A"}
        Company: ${contact.company || "N/A"}
        Service Interest: ${contact.service || "N/A"}
        
        Message:
        ${contact.message}
      `,
      html: `
        <h3>New contact inquiry received:</h3>
        <p><strong>Name:</strong> ${contact.name}</p>
        <p><strong>Email:</strong> ${contact.email}</p>
        <p><strong>Phone:</strong> ${contact.phone || "N/A"}</p>
        <p><strong>Company:</strong> ${contact.company || "N/A"}</p>
        <p><strong>Service Interest:</strong> ${contact.service || "N/A"}</p>
        <br>
        <p><strong>Message:</strong></p>
        <p>${contact.message.replace(/\n/g, "<br>")}</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info({ msgId: info.messageId }, "Contact notification email sent");
    return info;
  } catch (error) {
    logger.error({ err: error }, "Error sending contact notification email");
    throw error;
  }
}
