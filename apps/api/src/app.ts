import compression from "compression";
import cors, { type CorsOptions } from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { getCorsConfig } from "@studenthub/config";
import { env } from "./config/env.js";
import { AppError } from "./errors/app-error.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFoundHandler } from "./middlewares/not-found.js";
import { requestLogger } from "./middlewares/request-logger.middleware.js";
import { authenticate } from "./middlewares/auth.middleware.js";
import { docsRouter } from "./docs/swagger.js";
import { getHealth, getReadiness } from "./controllers/health.controller.js";
import {
  healthRouter,
  userRouter,
  authRouter,
  accommodationRouter,
  libraryRouter,
  messRouter,
  enquiryRouter,
  leadRouter,
  adminRouter,
  moderationRouter,
  searchRouter,
  monetizationRouter,
  reviewRoutes,
  ownerRoutes,
  recommendationRouter,
  crmRouter,
  emailRouter,
  locationRouter,
} from "./routes/index.js";

export function createApp(): Express {
  const app = express();

  // 1. Trust Proxy Configuration for Reverse Proxies (EC2, Nginx, Cloudflare)
  app.set("trust proxy", env.TRUST_PROXY);

  // 2. Disable server information disclosure
  app.disable("x-powered-by");

  // 3. Security Headers via Helmet (Hardened for Production API Exposure)
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disables CSP asset blocking for Swagger UI & cross-origin app assets
      crossOriginResourcePolicy: { policy: "cross-origin" },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      frameguard: { action: "sameorigin" },
      noSniff: true,
      xssFilter: true,
    }),
  );

  // 4. Centralized CORS Configuration via @studenthub/config
  const corsConfig = getCorsConfig(env);
  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      if (corsConfig.isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(
          new AppError(`CORS policy rejection for origin ${origin}`, 403, "CORS_NOT_ALLOWED"),
        );
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-Request-ID",
      "x-bypass-rate-limit",
    ],
    exposedHeaders: [
      "X-Request-ID",
      "RateLimit-Limit",
      "RateLimit-Remaining",
      "RateLimit-Reset",
      "Retry-After",
    ],
  };

  app.use(cors(corsOptions));

  // 5. Response Compression (Skips SSE, multipart file uploads, or explicit bypass headers)
  app.use(
    compression({
      filter: (req, res) => {
        const contentType = String(res.getHeader("Content-Type") || "");
        const reqContentType = String(req.headers["content-type"] || "");

        // Skip Server-Sent Events (SSE) streaming connections
        if (contentType.includes("text/event-stream")) return false;

        // Skip multipart binary file upload requests
        if (reqContentType.includes("multipart/form-data")) return false;

        // Skip explicit bypass header
        if (req.headers["x-no-compression"]) return false;

        return compression.filter(req, res);
      },
    }),
  );

  // 6. Request Body Size Limits
  app.use(express.json({ limit: env.REQUEST_SIZE_LIMIT }));
  app.use(express.urlencoded({ extended: true, limit: env.REQUEST_SIZE_LIMIT }));

  // 7. Request Tracing & Structured Pino Logging Middleware
  app.use(requestLogger);

  // 8. Health & Readiness Check Endpoints
  app.get("/health", getHealth);
  app.get("/ready", getReadiness);
  app.use("/api/health", healthRouter);

  // 9. Interactive API Documentation
  app.use("/api", docsRouter);

  // 10. Core Application API Routes
  app.use("/api/users", userRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/accommodations", accommodationRouter);
  app.use("/api/libraries", libraryRouter);
  app.use("/api/mess", messRouter);
  app.use("/api/enquiries", enquiryRouter);
  app.use("/api/leads", leadRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/moderation", moderationRouter);
  app.use("/api/search", searchRouter);
  app.use("/api/monetization", monetizationRouter);
  app.use("/api/reviews", reviewRoutes);
  app.use("/api/owners", ownerRoutes);
  app.use("/api/recommendations", recommendationRouter);
  app.use("/api/crm", crmRouter);
  app.use("/api/email", emailRouter);
  app.use("/api/location", locationRouter);

  // Non-production test routes
  if (env.NODE_ENV !== "production") {
    app.get("/api/test-error", () => {
      throw new Error("Simulated unhandled error");
    });
    app.get("/api/test-app-error", () => {
      throw new AppError("Simulated operational error", 400, "BAD_REQUEST");
    });
    app.get("/api/test-auth", authenticate, (req, res) => {
      res.status(200).json({ success: true, user: req.user });
    });
  }

  // 11. Centralized Error Handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
