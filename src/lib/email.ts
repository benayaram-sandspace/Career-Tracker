import nodemailer from "nodemailer";

export function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass || pass === "your-16-char-google-app-password") {
    return null;
  }

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
}: SendMailOptions): Promise<{ success: boolean; simulated?: boolean; messageId?: string; error?: string }> {
  try {
    const transporter = getTransporter();

    if (!transporter) {
      console.log(
        `[SMTP Simulation] To: ${to}, CC: ${cc || "none"}, Subject: "${subject}". Configure SMTP_USER and SMTP_PASS in .env to send real emails.`
      );
      return {
        success: true,
        simulated: true,
        messageId: "simulated-" + Date.now(),
      };
    }

    const fromAddress =
      process.env.SMTP_FROM || `Career Shift Tracker <${process.env.SMTP_USER}>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to,
      ...(cc ? { cc } : {}),
      subject,
      html,
    });

    console.log(`[SMTP Sent] Message sent to ${to}: ${info.messageId}`);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error("[SMTP Error] Failed to send email:", error.message || error);
    return {
      success: false,
      error: error.message || "Failed to send email",
    };
  }
}

export async function verifySmtp(): Promise<{ ok: boolean; message: string }> {
  try {
    const transporter = getTransporter();
    if (!transporter) {
      return {
        ok: false,
        message: "SMTP credentials not provided or using placeholder values in .env.",
      };
    }
    await transporter.verify();
    return { ok: true, message: "SMTP server verified successfully." };
  } catch (error: any) {
    return {
      ok: false,
      message: error.message || "Failed to connect to SMTP server.",
    };
  }
}
