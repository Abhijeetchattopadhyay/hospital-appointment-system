import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  let transporter;

  // Fallback to ethereal if no SMTP config is in env
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Dynamic Ethereal account creation for testing
    console.log("No SMTP configuration found in env variables. Generating Ethereal test account...");
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const message = {
    from: `${process.env.FROM_NAME || "MediCare+"} <${process.env.FROM_EMAIL || "noreply@medicare.com"}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(message);

  console.log("Password Reset Mail sent successfully!");
  console.log("Message ID: %s", info.messageId);
  if (!process.env.SMTP_HOST) {
    console.log("----------------------------------------");
    console.log("SMTP Preview URL (Ethereal inbox):");
    console.log(nodemailer.getTestMessageUrl(info));
    console.log("----------------------------------------");
  }
};

export default sendEmail;
