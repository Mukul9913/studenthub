import { z } from "zod";

export const createEnquirySchema = {
  body: z.object({
    targetType: z.enum(["ACCOMMODATION", "LIBRARY", "MESS"], {
      required_error: "targetType is required",
      invalid_type_error: "targetType must be ACCOMMODATION, LIBRARY or MESS",
    }),
    targetId: z
      .string({ required_error: "targetId is required" })
      .min(1, "targetId cannot be empty")
      .trim(),
    message: z
      .string({ required_error: "Message is required" })
      .min(5, "Message must be at least 5 characters")
      .max(1000, "Message cannot exceed 1000 characters")
      .trim(),
  }),
};

export const updateEnquiryStatusSchema = {
  body: z.object({
    status: z.enum(["NEW", "CONTACTED", "VISIT_SCHEDULED", "CONVERTED", "CLOSED"], {
      required_error: "Status is required",
      invalid_type_error: "Invalid enquiry status value",
    }),
  }),
};
