import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";
import { UserModel } from "../db/db_schema.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,   // from Brevo SMTP settings (your login email)
    pass: process.env.BREVO_SMTP_KEY,    // from Brevo SMTP settings (the key/password)
  },
});

export default async function Forgotpassword(req, res) {
  const { email } = req.body;
  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message: "If that email is registered, a reset link has been sent.",
      });
    }

    if (user.resettoken && user.resettokenexpiry > Date.now()) {
      return res.status(429).json({
        message: "A reset link was already sent. Please wait before requesting another.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resettoken = hashedToken;
    user.resettokenexpiry = Date.now() + 5 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/?t=${resetToken}`;

    try {
      await transporter.sendMail({
        from: `"Brainly" <${process.env.BREVO_SMTP_USER}>`,
        to: user.email,
        subject: "Password Reset Request",
        html: `
          <h2>Reset Your Password</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link expires in 5 minutes.</p>
          <p>If you did not request this, you can safely ignore this email.</p>
        `,
      });
    } catch (mailError) {
      user.resettoken = undefined;
      user.resettokenexpiry = undefined;
      await user.save();
      throw mailError;
    }

    return res.status(200).json({
      message: "If that email is registered, a reset link has been sent.",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      message: "Something went wrong. Please try again later.",
    });
  }
}
