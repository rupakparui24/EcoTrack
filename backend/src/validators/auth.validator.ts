import { Role } from "@prisma/client";
import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Valid email is required").toLowerCase(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.nativeEnum(Role)
});

export const loginSchema = z.object({
  email: z.string().trim().email("Valid email is required").toLowerCase(),
  password: z.string().min(1, "Password is required")
});

