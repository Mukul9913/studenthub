import compression from "compression";
import cors, { type CorsOptions } from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { AppError } from "./errors/app-error.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFoundHandler } from "./middlewares/not-found.js";
import { requestLogger } from "./middlewares/request-logger.middleware.js";
import { authenticate } from "./middlewares/auth.middleware.js";
import { docsRouter } from "./docs/swagger.js";
import { getHealth } from "./controllers/health.controller.js";
import {
  healthRouter,
  userRouter,
  authRouter,
  accommodationRouter,
  libraryRouter,
  enquiryRouter,
  adminRouter,
} from "./routes/index.js";

export function createApp(): Express {
  const app = express();

  // 1. Trust Proxy Configuration for Reverse Proxies (Railway, Nginx, Cloudflare)
  app.set("trust proxy", env.TRUST_PROXY);

  // 2. Disable server information disclosure
  app.disable("x-powered-by");

  // 3. Security Headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disables CSP asset blocking for Swagger UI and cross-origin app assets
      crossOriginResourcePolicy: { policy: "cross-origin" },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    }),
  );

  // 4. Secure CORS Configuration
  const allowedOriginsList = Array.from(
    new Set([
      env.CLIENT_URL,
      ...env.ALLOWED_ORIGINS.split(",")
        .map((o) => o.trim())
        .filter(Boolean),
    ]),
  );

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      if (
        env.NODE_ENV === "development" ||
        allowedOriginsList.includes(origin) ||
        origin.startsWith("http://localhost:")
      ) {
        callback(null, true);
      } else {
        callback(
          new AppError(`CORS policy rejection for origin ${origin}`, 403, "CORS_NOT_ALLOWED"),
        );
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "x-bypass-rate-limit"],
    exposedHeaders: ["RateLimit-Limit", "RateLimit-Remaining", "RateLimit-Reset", "Retry-After"],
  };

  app.use(cors(corsOptions));

  // 5. Response Compression
  app.use(
    compression({
      filter: (req, res) => {
        if (req.headers["x-no-compression"]) return false;
        return compression.filter(req, res);
      },
    }),
  );

  // 6. Request Body Size Limits
  app.use(express.json({ limit: env.REQUEST_SIZE_LIMIT }));
  app.use(express.urlencoded({ extended: true, limit: env.REQUEST_SIZE_LIMIT }));

  // 7. Request Tracing & Structured Pino Logging
  app.use(requestLogger);

  // 8. Health Check Endpoints (Root /health and Versioned /api/health)
  app.get("/health", getHealth);
  app.use("/api/health", healthRouter);

  // 9. Interactive API Documentation
  app.use("/api", docsRouter);

  // 10. Core Application API Routes
  app.use("/api/users", userRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/accommodations", accommodationRouter);
  app.use("/api/libraries", libraryRouter);
  app.use("/api/enquiries", enquiryRouter);
  app.use("/api/admin", adminRouter);

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
