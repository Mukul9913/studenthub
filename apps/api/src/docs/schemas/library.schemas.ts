export const librarySchemas = {
  Library: {
    type: "object",
    properties: {
      id: { type: "string", example: "66abb3c4e4b0a1a2b3c4d5e8" },
      ownerId: { type: "string", example: "66abb1c2e4b0a1a2b3c4d5e6" },
      name: { type: "string", example: "Saarthi Silent Study Library & Reading Room" },
      slug: { type: "string", example: "saarthi-silent-study-library-bhawarkua" },
      description: {
        type: "string",
        example:
          "24x7 soundproof silent reading hall with ergonomic study chairs, personal lockers, high-speed fiber Wi-Fi, and power backup.",
      },
      location: {
        type: "object",
        properties: {
          address: { type: "string", example: "Plot 45, Above ICICI Bank, Bhawarkua Square" },
          city: { type: "string", example: "indore" },
          state: { type: "string", example: "Madhya Pradesh" },
          zipCode: { type: "string", example: "452001" },
          coordinates: { $ref: "#/components/schemas/GeoLocation" },
        },
      },
      area: { type: "string", example: "Bhawarkua" },
      contact: {
        type: "object",
        properties: {
          phone: { type: "string", example: "+919876543210" },
          email: { type: "string", example: "info@saarthilibrary.com" },
          website: { type: "string", example: "https://saarthilibrary.com" },
        },
      },
      pricing: {
        type: "object",
        properties: {
          monthlyFee: { type: "number", example: 1200 },
          weeklyFee: { type: "number", example: 400 },
          dailyFee: { type: "number", example: 80 },
          registrationFee: { type: "number", example: 200 },
        },
      },
      facilities: {
        type: "array",
        items: { type: "string" },
        example: [
          "ac",
          "wifi",
          "power_backup",
          "individual_desk",
          "locker",
          "twenty_four_seven_access",
        ],
      },
      operatingHours: {
        type: "object",
        properties: {
          openingTime: { type: "string", example: "06:00" },
          closingTime: { type: "string", example: "23:00" },
          openDays: {
            type: "array",
            items: { type: "string" },
            example: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
          },
          is24x7: { type: "boolean", example: true },
        },
      },
      seatCapacity: { type: "number", example: 120 },
      availableSeats: { type: "number", example: 15 },
      images: {
        type: "array",
        items: { type: "string" },
        example: [
          "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      isVerified: { type: "boolean", example: true },
      status: {
        type: "string",
        enum: ["draft", "pending_review", "published", "rejected", "archived"],
        example: "published",
      },
      createdAt: { type: "string", format: "date-time", example: "2026-08-01T10:00:00.000Z" },
      updatedAt: { type: "string", format: "date-time", example: "2026-08-01T10:00:00.000Z" },
    },
  },
  CreateLibraryInput: {
    type: "object",
    required: ["name", "description", "location", "area", "pricing", "seatCapacity"],
    properties: {
      name: { type: "string", example: "Saarthi Silent Study Library" },
      description: {
        type: "string",
        example: "24x7 soundproof silent reading hall with ergonomic study chairs.",
      },
      location: {
        type: "object",
        required: ["address", "city", "state", "zipCode"],
        properties: {
          address: { type: "string", example: "Plot 45, Bhawarkua Square" },
          city: { type: "string", example: "indore" },
          state: { type: "string", example: "Madhya Pradesh" },
          zipCode: { type: "string", example: "452001" },
        },
      },
      area: { type: "string", example: "Bhawarkua" },
      pricing: {
        type: "object",
        required: ["monthlyFee"],
        properties: {
          monthlyFee: { type: "number", example: 1200 },
          weeklyFee: { type: "number", example: 400 },
          dailyFee: { type: "number", example: 80 },
        },
      },
      seatCapacity: { type: "number", example: 120 },
      availableSeats: { type: "number", example: 15 },
      facilities: {
        type: "array",
        items: { type: "string" },
        example: ["ac", "wifi", "power_backup"],
      },
      images: {
        type: "array",
        items: { type: "string" },
        example: ["https://images.unsplash.com/photo-1521587760476"],
      },
    },
  },
  PaginatedLibrariesResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/Library" },
          },
          total: { type: "number", example: 18 },
          page: { type: "number", example: 1 },
          pageSize: { type: "number", example: 9 },
          totalPages: { type: "number", example: 2 },
        },
      },
    },
  },
  SingleLibraryResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: { $ref: "#/components/schemas/Library" },
    },
  },
};
