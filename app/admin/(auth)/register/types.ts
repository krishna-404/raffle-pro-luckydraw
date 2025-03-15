import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  token: z.string().min(1, "Registration token is required"),
});

export type RegisterFormData = z.infer<typeof registerSchema>; 