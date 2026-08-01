export const accommodationSchemas = {
  Accommodation: {
    type: "object",
    properties: {
      id: { type: "string", example: "66abb2a3e4b0a1a2b3c4d5e7" },
      ownerId: { type: "string", example: "66abb1c2e4b0a1a2b3c4d5e6" },
      title: { type: "string", example: "Royal Palace Girls Hostel & PG" },
      description: {
        type: "string",
        example:
          "Luxury 24/7 guarded girls PG with AC, high-speed Wi-Fi, and home-style food near Bhawarkua coaching hub.",
      },
      propertyType: {
        type: "string",
        enum: ["PG", "Hostel", "Private Room", "Shared Room"],
        example: "PG",
      },
      location: {
        type: "object",
        properties: {
          address: {
            type: "string",
            example: "12/4 Bhawarkua Main Road, Opposite Allen Career Institute",
          },
          city: { type: "string", example: "indore" },
          state: { type: "string", example: "Madhya Pradesh" },
          zipCode: { type: "string", example: "452001" },
          coordinates: { $ref: "#/components/schemas/GeoLocation" },
        },
      },
      area: { type: "string", example: "Bhawarkua" },
      nearbyColleges: {
        type: "array",
        items: { type: "string" },
        example: ["IET DAVV", "Holkar Science College"],
      },
      nearbyCompanies: {
        type: "array",
        items: { type: "string" },
        example: ["TCS Indore", "Infosys Super Corridor"],
      },
      amenities: {
        type: "array",
        items: { type: "string" },
        example: ["WiFi", "AC", "Power Backup", "Laundry", "CCTV", "Security", "Study Table"],
      },
      images: {
        type: "array",
        items: { type: "string" },
        example: [
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
        ],
      },
      isVerified: { type: "boolean", example: true },
      status: {
        type: "string",
        enum: ["draft", "pending_review", "published", "rejected", "suspended"],
        example: "published",
      },
      rejectionReason: { type: "string", example: null },
      avgRating: { type: "number", example: 4.8 },
      reviewsCount: { type: "number", example: 24 },
      createdAt: { type: "string", format: "date-time", example: "2026-08-01T10:00:00.000Z" },
      updatedAt: { type: "string", format: "date-time", example: "2026-08-01T10:00:00.000Z" },
    },
  },
  CreateAccommodationInput: {
    type: "object",
    required: ["title", "description", "propertyType", "location", "area"],
    properties: {
      title: { type: "string", example: "Royal Palace Girls Hostel & PG" },
      description: {
        type: "string",
        example:
          "Luxury 24/7 guarded girls PG with AC, high-speed Wi-Fi, and home-style food near Bhawarkua coaching hub.",
      },
      propertyType: {
        type: "string",
        enum: ["PG", "Hostel", "Private Room", "Shared Room"],
        example: "PG",
      },
      location: {
        type: "object",
        required: ["address", "city", "state", "zipCode"],
        properties: {
          address: { type: "string", example: "12/4 Bhawarkua Main Road, Opposite Allen" },
          city: { type: "string", example: "indore" },
          state: { type: "string", example: "Madhya Pradesh" },
          zipCode: { type: "string", example: "452001" },
        },
      },
      area: { type: "string", example: "Bhawarkua" },
      nearbyColleges: { type: "array", items: { type: "string" }, example: ["IET DAVV"] },
      nearbyCompanies: { type: "array", items: { type: "string" }, example: ["TCS Indore"] },
      amenities: { type: "array", items: { type: "string" }, example: ["WiFi", "AC", "Laundry"] },
      images: {
        type: "array",
        items: { type: "string" },
        example: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"],
      },
    },
  },
  PaginatedAccommodationsResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: { $ref: "#/components/schemas/Accommodation" },
          },
          total: { type: "number", example: 42 },
          page: { type: "number", example: 1 },
          pageSize: { type: "number", example: 9 },
          totalPages: { type: "number", example: 5 },
        },
      },
    },
  },
  SingleAccommodationResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      data: { $ref: "#/components/schemas/Accommodation" },
    },
  },
};
