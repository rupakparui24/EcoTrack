import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  description: z.string().trim().optional().or(z.literal("")),
  location: z.string().trim().optional().or(z.literal(""))
});

export const addProjectMemberSchema = z
  .object({
    userId: z.string().trim().optional(),
    email: z.string().trim().email().toLowerCase().optional()
  })
  .refine((value) => value.userId || value.email, {
    message: "User ID or email is required"
  });

