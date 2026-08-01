import { commonSchemas } from "./schemas/common.schemas.js";
import { authSchemas } from "./schemas/auth.schemas.js";
import { accommodationSchemas } from "./schemas/accommodation.schemas.js";
import { librarySchemas } from "./schemas/library.schemas.js";
import { enquirySchemas } from "./schemas/enquiry.schemas.js";
import { adminSchemas } from "./schemas/admin.schemas.js";

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "StudentHub REST API Documentation",
    version: "1.0.0",
    description:
      "Official OpenAPI 3.0 REST API specification for **StudentHub** — Indore's premier platform for Student Accommodations (PGs/Hostels), Silent Study Libraries, Mess Tiffins, and Local Utilities.\n\n### Authentication\nMost endpoints require JWT Authentication. Click **Authorize** above and enter your Bearer token in the format: `Bearer <your_jwt_token>`.",
    contact: {
      name: "StudentHub Engineering Team",
      email: "support@studenthub.in",
      url: "https://studenthub.in",
    },
    license: {
      name: "Proprietary",
    },
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local Development Server",
    },
    {
      url: "https://api.studenthub.in",
      description: "Production Server",
    },
  ],
  tags: [
    { name: "Health", description: "Health check & diagnostic endpoints" },
    {
      name: "Auth & Profile",
      description: "User registration, authentication, session tokens & profile",
    },
    { name: "Accommodations", description: "PGs, Hostels, and Private Room listings in Indore" },
    { name: "Libraries", description: "Silent study libraries and reading room listings" },
    {
      name: "Enquiries & Leads",
      description: "Student lead submissions and owner lead management",
    },
    {
      name: "Admin Portal",
      description: "System metrics, listing moderation, and user governance",
    },
  ],
  security: [
    {
      bearerAuth: [],
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your valid JWT Access Token",
      },
    },
    schemas: {
      ...commonSchemas,
      ...authSchemas,
      ...accommodationSchemas,
      ...librarySchemas,
      ...enquirySchemas,
      ...adminSchemas,
    },
  },
  paths: {
    // HEALTH
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Check API Health Status",
        description: "Returns the operational status, database connectivity, and uptime metrics.",
        security: [],
        responses: {
          "200": {
            description: "Service is healthy",
            content: {
              "application/json": {
                example: {
                  status: "ok",
                  service: "studenthub-api",
                  timestamp: "2026-08-01T10:00:00.000Z",
                  uptimeSeconds: 3600,
                  database: "connected",
                },
              },
            },
          },
          "500": {
            description: "Server or database degraded",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/InternalServerError" } },
            },
          },
        },
      },
    },

    // AUTH
    "/api/auth/register": {
      post: {
        tags: ["Auth & Profile"],
        summary: "Register New User Account",
        description: "Create a new account for a Student, Professional, or Property/Library Owner.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterInput" },
            },
          },
        },
        responses: {
          "201": {
            description: "User successfully registered",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } },
            },
          },
          "400": {
            description: "Validation error or duplicate email",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
            },
          },
        },
      },
    },

    "/api/auth/login": {
      post: {
        tags: ["Auth & Profile"],
        summary: "Authenticate User & Issue Tokens",
        description:
          "Authenticate using email and password to receive JWT access and refresh tokens.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Authentication successful",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } },
            },
          },
          "401": {
            description: "Invalid email or password",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/UnauthorizedError" } },
            },
          },
        },
      },
    },

    "/api/auth/me": {
      get: {
        tags: ["Auth & Profile"],
        summary: "Get Authenticated User Info",
        description: "Retrieves details of the currently logged-in user from the JWT session.",
        responses: {
          "200": {
            description: "User details retrieved",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    user: {
                      id: "66abb1c2e4b0a1a2b3c4d5e6",
                      firstName: "Aarav",
                      lastName: "Sharma",
                      email: "aarav.sharma@example.com",
                      role: "student",
                    },
                  },
                },
              },
            },
          },
          "401": {
            description: "Missing or invalid Bearer token",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/UnauthorizedError" } },
            },
          },
        },
      },
    },

    "/api/auth/refresh": {
      post: {
        tags: ["Auth & Profile"],
        summary: "Refresh Access Token",
        description: "Issues a fresh JWT access token using a valid refresh token.",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshTokenInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Token refreshed successfully",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/TokenRefreshResponse" } },
            },
          },
          "401": {
            description: "Invalid or expired refresh token",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/UnauthorizedError" } },
            },
          },
        },
      },
    },

    "/api/auth/logout": {
      post: {
        tags: ["Auth & Profile"],
        summary: "Logout User Session",
        description: "Invalidates the refresh token and clears the user session.",
        security: [],
        responses: {
          "200": {
            description: "Successfully logged out",
            content: {
              "application/json": {
                example: { success: true, message: "Logged out successfully" },
              },
            },
          },
        },
      },
    },

    "/api/users/{id}": {
      get: {
        tags: ["Auth & Profile"],
        summary: "Get User Details by ID",
        description: "Retrieve profile details for a specific user ID.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "66abb1c2e4b0a1a2b3c4d5e6",
          },
        ],
        responses: {
          "200": {
            description: "User details retrieved",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: { id: "66abb1c2e4b0a1a2b3c4d5e6", firstName: "Aarav", lastName: "Sharma" },
                },
              },
            },
          },
          "404": {
            description: "User not found",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/NotFoundError" } },
            },
          },
        },
      },
      patch: {
        tags: ["Auth & Profile"],
        summary: "Update User Profile",
        description: "Update user profile fields like first name, last name, phone, or avatar.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateProfileInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "User profile updated",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } },
            },
          },
        },
      },
    },

    // ACCOMMODATIONS
    "/api/accommodations": {
      get: {
        tags: ["Accommodations"],
        summary: "List & Search Accommodations",
        description:
          "Public endpoint to search, filter, and paginate verified PGs, Hostels, and Rooms in Indore.",
        security: [],
        parameters: [
          {
            name: "q",
            in: "query",
            schema: { type: "string" },
            description: "Text search query for title, landmark or area",
          },
          {
            name: "area",
            in: "query",
            schema: { type: "string" },
            description: "Indore locality filter (e.g. Bhawarkua, Vijay Nagar)",
          },
          {
            name: "propertyType",
            in: "query",
            schema: { type: "string", enum: ["PG", "Hostel", "Private Room", "Shared Room"] },
          },
          {
            name: "genderPreference",
            in: "query",
            schema: { type: "string", enum: ["Male", "Female"] },
          },
          {
            name: "minRent",
            in: "query",
            schema: { type: "number" },
            description: "Minimum monthly rent in INR",
          },
          {
            name: "maxRent",
            in: "query",
            schema: { type: "number" },
            description: "Maximum monthly rent in INR",
          },
          {
            name: "sort",
            in: "query",
            schema: { type: "string", enum: ["recommended", "rent-asc", "rent-desc", "recent"] },
          },
          { name: "page", in: "query", schema: { type: "number", default: 1 } },
          { name: "limit", in: "query", schema: { type: "number", default: 9 } },
        ],
        responses: {
          "200": {
            description: "Paginated list of accommodations",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedAccommodationsResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Accommodations"],
        summary: "Create Accommodation Listing",
        description: "Allows property owners or admins to create a new PG or Hostel listing.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateAccommodationInput" },
            },
          },
        },
        responses: {
          "201": {
            description: "Listing created in draft or pending_review status",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SingleAccommodationResponse" },
              },
            },
          },
          "401": {
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/UnauthorizedError" } },
            },
          },
          "403": {
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ForbiddenError" } },
            },
          },
        },
      },
    },

    "/api/accommodations/owner/my-listings": {
      get: {
        tags: ["Accommodations"],
        summary: "Get Owner's Accommodation Listings",
        description: "Retrieves all accommodation listings created by the authenticated owner.",
        responses: {
          "200": {
            description: "List of owner accommodations",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: [
                    {
                      id: "66abb2a3e4b0a1a2b3c4d5e7",
                      title: "Royal Palace Girls PG",
                      status: "published",
                    },
                  ],
                },
              },
            },
          },
        },
      },
    },

    "/api/accommodations/{id}": {
      get: {
        tags: ["Accommodations"],
        summary: "Get Accommodation Details",
        description: "Retrieves complete details of an accommodation listing by ID.",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "66abb2a3e4b0a1a2b3c4d5e7",
          },
        ],
        responses: {
          "200": {
            description: "Accommodation details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SingleAccommodationResponse" },
              },
            },
          },
          "404": {
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/NotFoundError" } },
            },
          },
        },
      },
      patch: {
        tags: ["Accommodations"],
        summary: "Update Accommodation Listing",
        description: "Updates an existing accommodation listing by ID.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateAccommodationInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Accommodation updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SingleAccommodationResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Accommodations"],
        summary: "Delete Accommodation Listing",
        description: "Deletes an accommodation listing by ID.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            description: "Listing deleted successfully",
            content: {
              "application/json": { example: { success: true, message: "Listing deleted" } },
            },
          },
        },
      },
    },

    // LIBRARIES
    "/api/libraries": {
      get: {
        tags: ["Libraries"],
        summary: "List & Search Study Libraries",
        description:
          "Public endpoint to search, filter, and paginate silent study libraries in Indore.",
        security: [],
        parameters: [
          {
            name: "query",
            in: "query",
            schema: { type: "string" },
            description: "Search by library name or landmark",
          },
          {
            name: "area",
            in: "query",
            schema: { type: "string" },
            description: "Area in Indore (e.g. Bhawarkua, Vijay Nagar)",
          },
          { name: "minFee", in: "query", schema: { type: "number" } },
          { name: "maxFee", in: "query", schema: { type: "number" } },
          { name: "ac", in: "query", schema: { type: "boolean" } },
          { name: "wifi", in: "query", schema: { type: "boolean" } },
          { name: "powerBackup", in: "query", schema: { type: "boolean" } },
          { name: "is24x7", in: "query", schema: { type: "boolean" } },
          {
            name: "sort",
            in: "query",
            schema: { type: "string", enum: ["recommended", "fee-asc", "fee-desc", "rating"] },
          },
          { name: "page", in: "query", schema: { type: "number", default: 1 } },
          { name: "limit", in: "query", schema: { type: "number", default: 9 } },
        ],
        responses: {
          "200": {
            description: "Paginated list of study libraries",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedLibrariesResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Libraries"],
        summary: "Create Study Library Listing",
        description: "Allows library owners or admins to create a new study library listing.",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/CreateLibraryInput" } },
          },
        },
        responses: {
          "201": {
            description: "Library listing created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SingleLibraryResponse" },
              },
            },
          },
        },
      },
    },

    "/api/libraries/owner/my-libraries": {
      get: {
        tags: ["Libraries"],
        summary: "Get Owner's Study Library Listings",
        description: "Retrieves all study library listings created by the authenticated owner.",
        responses: {
          "200": {
            description: "List of owner libraries",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedLibrariesResponse" },
              },
            },
          },
        },
      },
    },

    "/api/libraries/{id}": {
      get: {
        tags: ["Libraries"],
        summary: "Get Study Library Details",
        description: "Retrieves details of a study library by ID.",
        security: [],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "66abb3c4e4b0a1a2b3c4d5e8",
          },
        ],
        responses: {
          "200": {
            description: "Library details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SingleLibraryResponse" },
              },
            },
          },
          "404": {
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/NotFoundError" } },
            },
          },
        },
      },
      patch: {
        tags: ["Libraries"],
        summary: "Update Study Library Listing",
        description: "Updates an existing study library listing by ID.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/CreateLibraryInput" } },
          },
        },
        responses: {
          "200": {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SingleLibraryResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Libraries"],
        summary: "Delete Study Library Listing",
        description: "Deletes a study library listing by ID.",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": {
            content: {
              "application/json": { example: { success: true, message: "Library deleted" } },
            },
          },
        },
      },
    },

    // ENQUIRIES
    "/api/enquiries": {
      get: {
        tags: ["Enquiries & Leads"],
        summary: "Get All Platform Enquiries (Admin)",
        description: "Retrieves all user enquiries submitted across accommodations and libraries.",
        responses: {
          "200": {
            description: "List of all platform enquiries",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/EnquiryListResponse" } },
            },
          },
          "403": {
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ForbiddenError" } },
            },
          },
        },
      },
      post: {
        tags: ["Enquiries & Leads"],
        summary: "Submit New Enquiry / Lead",
        description:
          "Allows a student or professional to submit an inquiry to a property or library owner.",
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/CreateEnquiryInput" } },
          },
        },
        responses: {
          "201": {
            description: "Enquiry submitted successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SingleEnquiryResponse" },
              },
            },
          },
          "409": {
            description: "Active duplicate enquiry already exists",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } },
            },
          },
        },
      },
    },

    "/api/enquiries/me": {
      get: {
        tags: ["Enquiries & Leads"],
        summary: "Get Current User's Submitted Enquiries",
        description: "Retrieves all inquiries submitted by the logged-in student/user.",
        responses: {
          "200": {
            description: "List of user enquiries",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/EnquiryListResponse" } },
            },
          },
        },
      },
    },

    "/api/enquiries/owner/leads": {
      get: {
        tags: ["Enquiries & Leads"],
        summary: "Get Incoming Owner Leads",
        description:
          "Retrieves incoming customer inquiries and leads for listings owned by the authenticated owner.",
        parameters: [
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["ALL", "NEW", "CONTACTED", "VISIT_SCHEDULED", "CONVERTED", "CLOSED"],
            },
          },
          {
            name: "targetType",
            in: "query",
            schema: { type: "string", enum: ["ALL", "ACCOMMODATION", "LIBRARY"] },
          },
        ],
        responses: {
          "200": {
            description: "List of owner leads with student contact details",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/EnquiryListResponse" } },
            },
          },
        },
      },
    },

    "/api/enquiries/owner/leads/{id}/status": {
      patch: {
        tags: ["Enquiries & Leads"],
        summary: "Update Lead Status",
        description:
          "Update status of an incoming lead (e.g. from NEW to CONTACTED, VISIT_SCHEDULED, CONVERTED, or CLOSED).",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: { $ref: "#/components/schemas/UpdateLeadStatusInput" } },
          },
        },
        responses: {
          "200": {
            description: "Lead status updated",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SingleEnquiryResponse" },
              },
            },
          },
        },
      },
    },

    // ADMIN
    "/api/admin/overview": {
      get: {
        tags: ["Admin Portal"],
        summary: "Get Admin Dashboard Metrics",
        description:
          "Returns platform overview counts including users, listings, approvals, and enquiries.",
        responses: {
          "200": {
            description: "Platform analytics overview",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/AdminOverviewStats" } },
            },
          },
          "403": {
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/ForbiddenError" } },
            },
          },
        },
      },
    },

    "/api/admin/listings": {
      get: {
        tags: ["Admin Portal"],
        summary: "Get Listings for Moderation",
        description:
          "Retrieves domain-aware listings requiring admin approval, rejection, or moderation.",
        parameters: [
          {
            name: "domain",
            in: "query",
            schema: { type: "string", enum: ["all", "accommodation", "library"] },
          },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["all", "pending_review", "published", "rejected", "draft"],
            },
          },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "area", in: "query", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "number", default: 1 } },
          { name: "limit", in: "query", schema: { type: "number", default: 10 } },
        ],
        responses: {
          "200": {
            description: "Moderation listings queue",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaginatedAdminListingsResponse" },
              },
            },
          },
        },
      },
    },

    "/api/admin/listings/{domain}/{id}/status": {
      patch: {
        tags: ["Admin Portal"],
        summary: "Approve or Reject Listing",
        description:
          "Updates the status of a property or library listing (Approve to published or Reject with reason).",
        parameters: [
          {
            name: "domain",
            in: "path",
            required: true,
            schema: { type: "string", enum: ["accommodation", "library"] },
          },
          { name: "id", in: "path", required: true, schema: { type: "string" } },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateListingStatusInput" },
            },
          },
        },
        responses: {
          "200": {
            description: "Listing status updated",
            content: {
              "application/json": {
                example: { success: true, message: "Status updated successfully" },
              },
            },
          },
        },
      },
    },

    "/api/admin/users": {
      get: {
        tags: ["Admin Portal"],
        summary: "Get All Users (Admin)",
        description: "Lists all registered users with role and search filters.",
        parameters: [
          {
            name: "role",
            in: "query",
            schema: { type: "string", enum: ["all", "student", "professional", "owner", "admin"] },
          },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "number", default: 1 } },
          { name: "limit", in: "query", schema: { type: "number", default: 10 } },
        ],
        responses: {
          "200": {
            description: "Paginated list of users",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    items: [
                      {
                        id: "66abb1c2e4b0a1a2b3c4d5e6",
                        firstName: "Aarav",
                        lastName: "Sharma",
                        email: "aarav@example.com",
                        role: "student",
                      },
                    ],
                    total: 1,
                    page: 1,
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/admin/owners": {
      get: {
        tags: ["Admin Portal"],
        summary: "Get All Business Owners (Admin)",
        description: "Lists all registered property & library owners along with listing counts.",
        parameters: [
          {
            name: "ownerType",
            in: "query",
            schema: { type: "string", enum: ["all", "accommodation", "library"] },
          },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "number", default: 1 } },
          { name: "limit", in: "query", schema: { type: "number", default: 10 } },
        ],
        responses: {
          "200": {
            description: "Paginated list of business owners",
            content: {
              "application/json": {
                example: {
                  success: true,
                  data: {
                    items: [
                      {
                        id: "66abb0b1e4b0a1a2b3c4d5e5",
                        firstName: "Vikram",
                        lastName: "Singh",
                        email: "vikram@example.com",
                        listingsCount: 3,
                      },
                    ],
                    total: 1,
                    page: 1,
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
