import jwt from "jsonwebtoken";
import { env } from "../config/env";

type TokenPayload = {
  userId: string;
};

export function signToken(userId: string) {
  return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

