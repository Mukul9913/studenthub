import { z } from "zod";

const phoneRegex = /^\+?[1-9]\d{1,14}$/;

export const registerSchema = {
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
      password: z
        .string({ required_error: "Password is required" })
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password must not exceed 100 characters"),
      phone: z.string().regex(phoneRegex, "Invalid phone number format").trim().optional(),
      role: z
        .enum(["student", "professional", "owner"], {
          errorMap: () => ({
            message: "Role must be student, professional, or owner",
          }),
        })
        .optional(),
      ownerType: z
        .enum(["accommodation", "library", "mess", "service_provider"], {
          errorMap: () => ({
            message: "ownerType must be accommodation, library, mess, or service_provider",
          }),
        })
        .optional(),
      avatar: z.string().url("Avatar must be a valid URL").trim().optional(),
    })
    .strict()
    .superRefine((data, ctx) => {
      if (data.role === "owner" && !data.ownerType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "ownerType is required when registering as owner",
          path: ["ownerType"],
        });
      }
    }),
};

export const loginSchema = {
  body: z
    .object({
      email: z
        .string({ required_error: "Email is required" })
        .email("Invalid email address format")
        .toLowerCase()
        .trim(),
      password: z.string({ required_error: "Password is required" }).min(1, "Password is required"),
    })
    .strict(),
};
