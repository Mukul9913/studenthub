export const enquirySchemas = {
  Enquiry: {
    type: "object",
    properties: {
      id: { type: "string", example: "66abb4d5e4b0a1a2b3c4d5e9" },
      userId: { type: "string", example: "66abb1c2e4b0a1a2b3c4d5e6" },
      ownerId: { type: "string", example: "66abb0b1e4b0a1a2b3c4d5e5" },
      targetType: { type: "string", enum: ["ACCOMMODATION", "LIBRARY"], example: "ACCOMMODATION" },
      targetId: { type: "string", example: "66abb2a3e4b0a1a2b3c4d5e7" },
      message: {
        type: "string",
        example:
          "Hi! I am looking for a single AC bed starting next Monday. Is a room available for site visit tomorrow?",
      },
      status: {
        type: "string",
        enum: ["NEW", "CONTACTED", "VISIT_SCHEDULED", "CONVERTED", "CLOSED"],
        example: "NEW",
      },
      createdAt: { type: "string", format: "date-time", example: "2026-08-01T10:30:00.000Z" },
      updatedAt: { type: "string", format: "date-time", example: "2026-08-01T10:30:00.000Z" },
      user: {
        type: "object",
        properties: {
          id: { type: "string", example: "66abb1c2e4b0a1a2b3c4d5e6" },
          name: { type: "string", example: "Aarav Sharma" },
          email: { type: "string", example: "aarav.sharma@example.com" },
          phone: { type: "string", example: "+919876543210" },
        },
      },
      targetDetails: {
        type: "object",
        properties: {
          id: { type: "string", example: "66abb2a3e4b0a1a2b3c4d5e7" },
          title: { type: "string", example: "Royal Palace Girls Hostel & PG" },
          area: { type: "string", example: "Bhawarkua" },
          image: {
            type: "string",
            example: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
          },
          link: { type: "string", example: "/accommodations/66abb2a3e4b0a1a2b3c4d5e7" },
        },
      },
    },
  },
  CreateEnquiryInput: {
    type: "object",
    required: ["targetType", "targetId", "message"],
    properties: {
      targetType: { type: "string", enum: ["ACCOMMODATION", "LIBRARY"], example: "ACCOMMODATION" },
      targetId: { type: "string", example: "66abb2a3e4b0a1a2b3c4d5e7" },
      message: { type: "string", example: "Is there an AC room available starting next month?" },
    },
  },
  UpdateLeadStatusInput: {
    type: "object",
    required: ["status"],
    properties: {
      status: {
        type: "string",
        enum: ["NEW", "CONTACTED", "VISIT_SCHEDULED", "CONVERTED", "CLOSED"],
        example: "CONTACTED",
      },
    },
  },
  EnquiryListResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "array",
        items: { $ref: "#/components/schemas/Enquiry" },
      },
    },
  },
  SingleEnquiryResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: { $ref: "#/components/schemas/Enquiry" },
    },
  },
};
