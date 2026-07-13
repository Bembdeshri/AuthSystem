import nodemailer from "nodemailer";

// Cache the transporter so it doesn't get re-created on every single send call
let cachedTransporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.ethereal.email",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    return cachedTransporter;
  }

  const testAccount = await nodemailer.createTestAccount();
  
  console.log("✉️ Ethereal Test Email Account Generated:");
  console.log(`   User: ${testAccount.user}`);
  console.log(`   Pass: ${testAccount.pass}`);

  cachedTransporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  return cachedTransporter;
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const verificationUrl = `http://localhost:5000/api/auth/verify-email?token=${token}`;
  const transporter = await getTransporter();

  const mailOptions = {
    from: '"AuthSystem Support" <noreply@authsystem.com>',
    to: email,
    subject: "Verify Your Email Address",
    html: `
      <h2>Welcome to AuthSystem!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <p><a href="${verificationUrl}" target="_blank" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a></p>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  
  // Force log this to confirm delivery!
  console.log(`📬 Verification email sent to: ${email}`);
  console.log(`👉 Preview Sent Email Here: ${nodemailer.getTestMessageUrl(info)}`);
}
/**
 * Sends a password reset email to the user.
 */
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetUrl = `http://localhost:5000/api/auth/reset-password?token=${token}`;
  const transporter = await getTransporter();

  const mailOptions = {
    from: '"AuthSystem Support" <noreply@authsystem.com>',
    to: email,
    subject: "Reset Your Password",
    html: `
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your password. Click the link below to choose a new one:</p>
      <p><a href="${resetUrl}" target="_blank" style="padding: 10px 20px; background-color: #E11D48; color: white; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <hr />
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`📬 Password reset email sent to: ${email}`);
  console.log(`👉 Preview Reset Email Here: ${nodemailer.getTestMessageUrl(info)}`);
}