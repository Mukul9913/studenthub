export const adminSchemas = {
  AdminOverviewStats: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "object",
        properties: {
          users: {
            type: "object",
            properties: {
              total: { type: "number", example: 1540 },
              students: { type: "number", example: 1100 },
              professionals: { type: "number", example: 320 },
              owners: { type: "number", example: 115 },
              admins: { type: "number", example: 5 },
            },
          },
          listings: {
            type: "object",
            properties: {
              total: { type: "number", example: 620 },
              accommodation: { type: "number", example: 480 },
              library: { type: "number", example: 140 },
              mess: { type: "number", example: 0 },
              serviceProvider: { type: "number", example: 0 },
            },
          },
          approvals: {
            type: "object",
            properties: {
              pending: { type: "number", example: 14 },
              approved: { type: "number", example: 580 },
              rejected: { type: "number", example: 16 },
              draft: { type: "number", example: 10 },
            },
          },
          enquiries: {
            type: "object",
            properties: {
              total: { type: "number", example: 3420 },
            },
          },
        },
      },
    },
  },
  AdminListingItem: {
    type: "object",
    properties: {
      id: { type: "string", example: "66abb2a3e4b0a1a2b3c4d5e7" },
      name: { type: "string", example: "Royal Palace Girls Hostel & PG" },
      domain: {
        type: "string",
        enum: ["accommodation", "library", "mess", "service_provider"],
        example: "accommodation",
      },
      owner: {
        type: "object",
        properties: {
          id: { type: "string", example: "66abb1c2e4b0a1a2b3c4d5e6" },
          firstName: { type: "string", example: "Vikram" },
          lastName: { type: "string", example: "Singh" },
          email: { type: "string", example: "vikram@example.com" },
          phone: { type: "string", example: "+919876543210" },
        },
      },
      area: { type: "string", example: "Bhawarkua" },
      status: {
        type: "string",
        enum: ["draft", "pending_review", "published", "rejected", "suspended"],
        example: "pending_review",
      },
      rejectionReason: { type: "string", example: null },
      createdAt: { type: "string", format: "date-time", example: "2026-08-01T10:00:00.000Z" },
      updatedAt: { type: "string", format: "date-time", example: "2026-08-01T10:00:00.000Z" },
      specs: { type: "object" },
    },
  },
  UpdateListingStatusInput: {
    type: "object",
    required: ["status"],
    properties: {
      status: {
        type: "string",
        enum: ["published", "rejected", "suspended", "pending_review"],
        example: "published",
      },
      rejectionReason: { type: "string", example: "Blurry property photos or inaccurate address." },
    },
  },
  PaginatedAdminListingsResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/AdminListingItem" },
          },
          total: { type: "number", example: 14 },
          page: { type: "number", example: 1 },
          pageSize: { type: "number", example: 10 },
          totalPages: { type: "number", example: 2 },
        },
      },
    },
  },
};
