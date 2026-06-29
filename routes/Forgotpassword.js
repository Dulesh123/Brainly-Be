import { Resend } from "resend";
import crypto from "crypto";
import dotenv from "dotenv";
import { UserModel } from "../db/db_schema.js";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

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
      await resend.emails.send({
        from: "onboarding@resend.dev", // replace with your domain later e.g. "no-reply@yourdomain.com"
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
