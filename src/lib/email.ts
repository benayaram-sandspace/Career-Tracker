import nodemailer from "nodemailer";

export function isSmtpConfigured(): boolean {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) return false;
  if (
    user.trim().length === 0 ||
    pass.trim().length === 0 ||
    user.includes("your-email") ||
    pass.includes("your-16-char")
  ) {
    return false;
  }
  return true;
}

export function getTransporter() {
  if (!isSmtpConfigured()) {
    return null;
  }

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER!;
  const pass = process.env.SMTP_PASS!;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

export interface SendMailOptions {
  to: string;
  cc?: string | null;
  subject: string;
  html: string;
}

export async function sendEmail({
  to,
  cc,
  subject,
  html,
}: SendMailOptions): Promise<{
  success: boolean;
  mode: "production" | "ethereal" | "simulated";
  messageId?: string;
  previewUrl?: string | false;
  error?: string;
}> {
  // 1. Try real configured SMTP transporter
  const transporter = getTransporter();
  if (transporter) {
    try {
      const fromAddress =
        process.env.SMTP_FROM || `Career Shift Tracker <${process.env.SMTP_USER}>`;

      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        ...(cc ? { cc } : {}),
        subject,
        html,
      });

      console.log(`[SMTP Sent] Real email delivered to ${to}: ${info.messageId}`);
      return {
        success: true,
        mode: "production",
        messageId: info.messageId,
      };
    } catch (error: any) {
      console.error("[SMTP Error] Real SMTP delivery failed:", error.message || error);
      return {
        success: false,
        mode: "production",
        error: error.message || "Failed to deliver email through configured SMTP server.",
      };
    }
  }

  // 2. Fallback: Ethereal test inbox for instant preview without credentials
  try {
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await testTransporter.sendMail({
      from: "Career Shift Tracker <test@careertracker.app>",
      to,
      ...(cc ? { cc } : {}),
      subject,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[SMTP Ethereal] Preview available at: ${previewUrl}`);

    return {
      success: true,
      mode: "ethereal",
      messageId: info.messageId,
      previewUrl,
    };
  } catch (e: any) {
    // 3. Fallback: Simulated in-memory
    console.log(
      `[SMTP Simulated] Email to: ${to}, Subject: "${subject}". Configure SMTP_USER and SMTP_PASS in .env for real email delivery.`
    );
    return {
      success: true,
      mode: "simulated",
      messageId: "simulated-" + Date.now(),
    };
  }
}

export async function verifySmtp(): Promise<{
  ok: boolean;
  configured: boolean;
  message: string;
}> {
  if (!isSmtpConfigured()) {
    return {
      ok: false,
      configured: false,
      message:
        "Real SMTP credentials are not yet configured in .env. We will send via Ethereal Test Sandbox so you can preview the email immediately.",
    };
  }

  try {
    const transporter = getTransporter();
    if (!transporter) {
      return {
        ok: false,
        configured: false,
        message: "Unable to create SMTP transporter.",
      };
    }
    await transporter.verify();
    return {
      ok: true,
      configured: true,
      message: "SMTP server verified successfully. Real email delivery is active.",
    };
  } catch (error: any) {
    return {
      ok: false,
      configured: true,
      message: error.message || "Failed to connect to SMTP server. Verify your credentials.",
    };
  }
}
