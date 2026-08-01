export const authSchemas = {
  User: {
    type: "object",
    properties: {
      id: { type: "string", example: "66abb1c2e4b0a1a2b3c4d5e6" },
      firstName: { type: "string", example: "Aarav" },
      lastName: { type: "string", example: "Sharma" },
      email: { type: "string", format: "email", example: "aarav.sharma@example.com" },
      phone: { type: "string", example: "+919876543210" },
      role: {
        type: "string",
        enum: ["student", "professional", "owner", "admin"],
        example: "student",
      },
      ownerType: {
        type: "string",
        enum: ["accommodation", "library", "mess", "service_provider"],
        nullable: true,
        example: null,
      },
      avatar: {
        type: "string",
        example: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      },
      isVerified: { type: "boolean", example: true },
      isActive: { type: "boolean", example: true },
      createdAt: { type: "string", format: "date-time", example: "2026-08-01T10:00:00.000Z" },
      updatedAt: { type: "string", format: "date-time", example: "2026-08-01T10:00:00.000Z" },
    },
  },
  RegisterInput: {
    type: "object",
    required: ["firstName", "lastName", "email", "password"],
    properties: {
      firstName: { type: "string", example: "Aarav" },
      lastName: { type: "string", example: "Sharma" },
      email: { type: "string", format: "email", example: "aarav.sharma@example.com" },
      password: { type: "string", format: "password", minLength: 6, example: "Password123!" },
      phone: { type: "string", example: "+919876543210" },
      role: {
        type: "string",
        enum: ["student", "professional", "owner"],
        default: "student",
        example: "student",
      },
      ownerType: {
        type: "string",
        enum: ["accommodation", "library", "mess", "service_provider"],
        example: "accommodation",
      },
    },
  },
  LoginInput: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email", example: "aarav.sharma@example.com" },
      password: { type: "string", format: "password", example: "Password123!" },
    },
  },
  AuthResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "object",
        properties: {
          user: { $ref: "#/components/schemas/User" },
          accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
          refreshToken: { type: "string", example: "d8f9a2b3c4d5e6f7a8b9c0d1e2f3a4b5" },
        },
      },
    },
  },
  RefreshTokenInput: {
    type: "object",
    required: ["refreshToken"],
    properties: {
      refreshToken: { type: "string", example: "d8f9a2b3c4d5e6f7a8b9c0d1e2f3a4b5" },
    },
  },
  TokenRefreshResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "object",
        properties: {
          accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
        },
      },
    },
  },
  UpdateProfileInput: {
    type: "object",
    properties: {
      firstName: { type: "string", example: "Aarav" },
      lastName: { type: "string", example: "Sharma" },
      phone: { type: "string", example: "+919876543210" },
      avatar: {
        type: "string",
        example: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      },
    },
  },
};
