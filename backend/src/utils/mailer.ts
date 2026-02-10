import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  SMTP_FROM,
} = process.env;

export function createTransporter() {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
    throw new Error("SMTP configuration missing");
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
}

export async function sendResetEmail(to: string, link: string) {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject: "Recuperar password",
    text: `Para recuperar a password, acede ao link: ${link}`,
    html: `<p>Para recuperar a password, clica aqui:</p><p><a href="${link}">${link}</a></p>`,
  });
}
