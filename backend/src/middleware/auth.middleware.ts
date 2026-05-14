import { NextFunction, Request, Response } from "express";
import { prisma } from "../config/prisma";
import { verifyToken } from "../utils/jwt";
import { errorResponse, toPublicUser } from "../utils/response";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return errorResponse(res, "Authentication token is required", 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user) {
      return errorResponse(res, "User no longer exists", 401);
    }

    req.user = toPublicUser(user);
    next();
  } catch {
    return errorResponse(res, "Invalid or expired token", 401);
  }
}

