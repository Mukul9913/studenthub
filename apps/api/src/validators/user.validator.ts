import { z } from "zod";

const phoneRegex = /^\+?[1-9]\d{1,14}$/;
const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createUserSchema = {
  body: z
    .object({
      firstName: z
        .string({ required_error: "First name is required" })
        .min(1, "First name must be at least 1 character")
        .max(50, "First name must not exceed 50 characters")
        .trim(),
      lastName: z
        .string({ required_error: "Last name is required" })
        .min(1, "Last name must be at least 1 character")
        .max(50, "Last name must not exceed 50 characters")
        .trim(),
      email: z
        .string({ required_error: "Email is required" })
        .email("Invalid email address format")
        .toLowerCase()
        .trim(),
      phone: z.string().regex(phoneRegex, "Invalid phone number format").trim().optional(),
      role: z
        .enum(["student", "professional", "owner", "admin"], {
          errorMap: () => ({
            message: "Role must be student, professional, owner, or admin",
          }),
        })
        .optional(),
      avatar: z.string().url("Avatar must be a valid URL").trim().optional(),
    })
    .strict(),
};

export const updateUserSchema = {
  body: z
    .object({
      firstName: z
        .string()
        .min(1, "First name must be at least 1 character")
        .max(50, "First name must not exceed 50 characters")
        .trim()
        .optional(),
      lastName: z
        .string()
        .min(1, "Last name must be at least 1 character")
        .max(50, "Last name must not exceed 50 characters")
        .trim()
        .optional(),
      phone: z.string().regex(phoneRegex, "Invalid phone number format").trim().optional(),
      ownerType: z.enum(["accommodation", "library", "mess", "service_provider"]).optional(),
      avatar: z.string().url("Avatar must be a valid URL").trim().optional(),
    })
    .strict(),
  params: z.object({
    id: z.string().regex(objectIdRegex, "Invalid user ID format"),
  }),
};

export const getUserSchema = {
  params: z.object({
    id: z.string().regex(objectIdRegex, "Invalid user ID format"),
  }),
};
