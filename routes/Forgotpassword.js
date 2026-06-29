import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";
import {UserModel} from "../db/db_schema.js";

dotenv.config();

// Fix #1: Create transporter once, outside the handler
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASSWORD,
  },
});
export default async function Forgotpassword(req, res) {
  const { email } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    // Fix #2: Never reveal whether the email exists (prevents user enumeration)
    if (!user) {
      return res.status(200).json({
        message: "If that email is registered, a reset link has been sent.",
      });
    }

    // Fix #3: Reject if a valid token was already issued recently
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

    // Fix #4: Use env variable instead of hardcoded localhost
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/?t=${resetToken}`;

    // Fix #5: If email fails, clear the token so it doesn't become orphaned
    try {
      await transporter.sendMail({
        from: process.env.EMAIL,
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
      throw mailError; // Re-throw to hit the outer catch and return 500
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
