import {UserModel} from "../db/db_schema.js";
import bcrypt from "bcrypt";

export default async function Signup(req, res) {
  const { f_name, l_name, email, password } = req.body;

  try {
    if (!f_name || !l_name || !email || !password) {
      return res.status(400).send("All fields are required");
    }

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res.status(409).send("User already exists");
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    await UserModel.create({
      f_name,
      l_name,
      email,
      password: encryptedPassword,
    });

    return res.status(201).json({
     user:{
        f_name,
      l_name,
      email,
     }

    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Something went wrong");
  }
}