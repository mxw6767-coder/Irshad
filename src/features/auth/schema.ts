import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(10).max(128),
  deviceName: z.string().min(1).max(64),
});

export const loginSchema = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(1).max(128),
});

