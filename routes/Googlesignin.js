import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import {UserModel} from "../db/db_schema.js";

export default async function Googlesignin(req, res) {
  const { token } = req.headers;

  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    // ── Verify the Google token ──
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email    = payload.email;
    const googleid = payload.sub;

    // ── Find user in DB by email ──
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "No account found. Please sign up first.",
      });
    }

    // ── Verify googleid matches what's stored ──
    if (user.googleid !== googleid) {
      return res.status(401).json({
        message: "Google account does not match. Please sign in with email.",
      });
    }

    // ── Assign JWT ──
    const authToken = jwt.sign(
      {
        id:    user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Sign in successful",
      token: authToken,
      user: {
        id:       user._id,
        f_name:   user.f_name,
        l_name:   user.l_name,
        email:    user.email,
        provider: user.provider,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}