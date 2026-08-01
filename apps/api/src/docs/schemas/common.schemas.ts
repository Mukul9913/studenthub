export const commonSchemas = {
  GeoLocation: {
    type: "object",
    properties: {
      type: { type: "string", example: "Point" },
      coordinates: {
        type: "array",
        items: { type: "number" },
        example: [75.8656, 22.6926],
        description: "[longitude, latitude]",
      },
    },
  },
  ErrorResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      error: {
        type: "object",
        properties: {
          code: { type: "string", example: "BAD_REQUEST" },
          message: { type: "string", example: "Invalid input parameters" },
          details: {
            type: "array",
            items: { type: "object" },
            example: [{ path: ["email"], message: "Invalid email format" }],
          },
        },
      },
    },
  },
  UnauthorizedError: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      error: {
        type: "object",
        properties: {
          code: { type: "string", example: "AUTH_REQUIRED" },
          message: { type: "string", example: "Authentication is required" },
        },
      },
    },
  },
  ForbiddenError: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      error: {
        type: "object",
        properties: {
          code: { type: "string", example: "FORBIDDEN" },
          message: {
            type: "string",
            example: "You do not have permission to access this resource",
          },
        },
      },
    },
  },
  NotFoundError: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      error: {
        type: "object",
        properties: {
          code: { type: "string", example: "NOT_FOUND" },
          message: { type: "string", example: "Resource not found" },
        },
      },
    },
  },
  InternalServerError: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      error: {
        type: "object",
        properties: {
          code: { type: "string", example: "INTERNAL_SERVER_ERROR" },
          message: { type: "string", example: "An unexpected error occurred on the server" },
        },
      },
    },
  },
};
