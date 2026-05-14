import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { AppError } from "../middleware/error.middleware";
import { signToken } from "../utils/jwt";
import { comparePassword, hashPassword } from "../utils/password";
import { successResponse, toPublicUser } from "../utils/response";

export async function signup(req: Request, res: Response) {
  const { name, email, password, role } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError("An account with this email already exists", 409);
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role }
  });

  const token = signToken(user.id);

  return successResponse(
    res,
    "Signup completed successfully",
    { user: toPublicUser(user), token },
    201
  );
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isValidPassword = await comparePassword(password, user.passwordHash);
  if (!isValidPassword) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken(user.id);

  return successResponse(res, "Login successful", {
    user: toPublicUser(user),
    token
  });
}

export async function me(req: Request, res: Response) {
  return successResponse(res, "Current user fetched successfully", req.user);
}

