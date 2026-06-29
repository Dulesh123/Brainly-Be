import {UserModel} from "../db/db_schema.js";
import crypto from "crypto";
import bcrypt from "bcrypt";

export default async function Resetpassword(req, res) {
  const { email, newPassword, token } = req.body;

  try {
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    if (hashedToken !== user.resettoken) {
      return res.status(400).json({
        message: "Invalid reset link",
      });
    }

    if (user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({
        message: "Reset link expired",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resettoken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    return res.status(200).json({
      message: "Password reset successful",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}