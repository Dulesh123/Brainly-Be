import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export default function VerifyUser(req, res, next) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      message: "Token missing",
    });
  }

  try {
    const decoded = jwt.verify(
      authorization,
      process.env.JWT_SECRET
    );

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid token",
    });
  }
}