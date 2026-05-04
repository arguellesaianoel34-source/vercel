import { Router } from "express";
import nodemailer from "nodemailer";
import { requireAuth } from "./auth";

const router = Router();

// Test SMTP connection with provided config
router.post("/email/test-connection", requireAuth, async (req, res) => {
  const { smtpHost, smtpPort, smtpUser, smtpPassword } = req.body;

  if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword) {
    return res.status(400).json({ error: "Missing required SMTP configuration" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpPort === "465",
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
      // Short timeout for testing
      connectionTimeout: 5000,
    });

    await transporter.verify();
    return res.json({ message: "SMTP connection successful!" });
  } catch (error: any) {
    return res.status(500).json({ 
      error: "Connection Failed", 
      message: error.message || "Could not connect to SMTP server" 
    });
  }
});

// Send test email with provided config
router.post("/email/send-test", requireAuth, async (req, res) => {
  const { smtpHost, smtpPort, smtpUser, smtpPassword, fromEmail, fromName, to, subject, text } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpPort === "465",
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    await transporter.sendMail({
      from: `"${fromName || "VibeAlong Test"}" <${fromEmail}>`,
      to,
      subject: subject || "Test Email from VibeAlong",
      text: text || "This is a test email to verify your SMTP settings.",
    });

    return res.json({ message: "Test email sent successfully!" });
  } catch (error: any) {
    return res.status(500).json({ 
      error: "Failed to Send", 
      message: error.message || "Could not send test email" 
    });
  }
});

export default router;
