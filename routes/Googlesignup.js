
import { OAuth2Client } from "google-auth-library";
import {UserModel} from "../db/db_schema.js";

export default async function Googlesignup(req, res) {
  const { token } = req.headers;
  console.log(token);

  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const f_name   = payload.given_name;
    const l_name   = payload.family_name ?? "";
    const email    = payload.email;
    const googleid = payload.sub;

    // ── Check if user already exists by email ──
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      // 409 = conflict — axios will throw this, caught by frontend catch block
      return res.status(409).json({
        message: "Account already exists. Please sign in.",
      });
    }

    // ── New user — create them ──
    const newUser = await UserModel.create({
      f_name,
      l_name,
      email,
      googleid,
      provider: "google",
    });

    // 201 = created — axios resolves this, caught by frontend if block
    return res.status(201).json({
      message: "Account created successfully",
      user: {
        id:       newUser._id,
        f_name:   newUser.f_name,
        l_name:   newUser.l_name,
        email:    newUser.email,
        provider: newUser.provider,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}
