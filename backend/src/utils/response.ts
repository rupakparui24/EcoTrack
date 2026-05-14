import { Response } from "express";
import { Role } from "@prisma/client";

export function successResponse<T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200
) {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data ?? null
  });
}

export function errorResponse(res: Response, message: string, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    message
  });
}

export function toPublicUser(user: {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}
