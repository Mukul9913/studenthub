# StudentHub Production Observability & Reliability Architecture

This document details the production observability, structured logging, health probing, security hardening, and graceful shutdown specifications implemented for the StudentHub API microservice.

---

## 1. Request ID Correlation & Context Tracing

### Implementation

- **Middleware**: `apps/api/src/middlewares/request-logger.middleware.ts`
- **Behavior**: Generates a unique UUIDv4 correlation identifier (`X-Request-ID`) for every inbound HTTP request (or respects upstream `X-Request-ID` headers from Cloudflare/Nginx).
- **Context Injection**: Attaches `req.requestId` to the Express Request context.
- **Header Propagation**: Returns `X-Request-ID` in HTTP response headers.
- **Log Correlation**: Embeds `requestId` in every Pino log message, enabling end-to-end request tracing across microservices and log aggregators (Datadog, Loki, AWS CloudWatch).

### Why Needed in Production

In distributed cloud architectures, thousands of concurrent requests execute simultaneously. Without correlation IDs, isolating log lines associated with a single failed transaction or slow query is nearly impossible.

---

## 2. Structured Pino Telemetry & Response Latency

### Implementation

- **Utility**: `apps/api/src/utils/logger.ts`
- **Log Format**: ISO-8601 timestamped structured JSON logs in production (`NODE_ENV === 'production'`), pretty-printed in development (`pino-pretty`).
- **Redaction**: Automatically redacts sensitive authentication fields (`password`, `refreshToken`, `accessToken`, `authorization`, `creditCard`).
- **Response Metrics**: Logs HTTP method, URL, status code, response time (`responseTimeMs`), remote IP, user agent, and authenticated `userId`.
- **Latency Monitoring**: Automatically flags slow requests exceeding `500ms` with a `slowRequest: true` metadata flag and warning severity.

### Why Needed in Production

JSON logs allow automated ingestion into Log Management platforms (Elasticsearch/Kibana, Datadog, Grafana Loki) for real-time alerting, latency percentile dashboards (P95/P99), and security auditing.

---

## 3. Standardized Global Error Architecture

### Implementation

- **Middleware**: `apps/api/src/middlewares/error-handler.ts`
- **Response Schema**:
  ```json
  {
    "success": false,
    "requestId": "a8f3b2c1-9e4d-4f1a-b2c3-d4e5f6a7b8c9",
    "message": "Resource not found",
    "errorCode": "NOT_FOUND",
    "timestamp": "2026-08-01T22:50:00.000Z"
  }
  ```
- **Security Hardening**: Stack traces are strictly omitted in production environments (`NODE_ENV === 'production'`). Stack details are exposed only in development mode.

### Why Needed in Production

Preventing stack trace leakage stops malicious actors from inspecting internal file paths or dependency versions, while standard error codes allow frontend clients to gracefully handle failures.

---

## 4. Health & Readiness Probes (`/api/health` & `/api/ready`)

### Implementation

- **Controllers**: `apps/api/src/controllers/health.controller.ts`
- **Health Probe (`GET /api/health`)**: Returns status HTTP 200 (or 503 if degraded) containing:
  - Application name, environment, uptime
  - Active MongoDB connection status and host
  - Memory usage statistics (`rssMb`, `heapTotalMb`, `heapUsedMb`)
  - Node.js runtime version
- **Readiness Probe (`GET /api/ready`)**: Returns HTTP 200 `ready: true` ONLY when `mongoose.connection.readyState === 1` (MongoDB Atlas connected). Returns HTTP 503 Service Unavailable when database connection is unavailable.

### Why Needed in Production

Kubernetes, Docker Swarm, and AWS ALB use Health and Readiness probes to route traffic away from unready or degraded container instances, preventing user-facing 500 errors during deployments or database outages.

---

## 5. Graceful Shutdown Signal Handling

### Implementation

- **File**: `apps/api/src/server.ts`
- **Signals**: Intercepts `SIGTERM` (Docker/Kubernetes termination signal) and `SIGINT` (`Ctrl+C`).
- **Shutdown Sequence**:
  1. Stops Express HTTP server from receiving new incoming network connections.
  2. Disconnects active MongoDB connection pools gracefully (`mongoose.disconnect()`).
  3. Enforces a 10-second hard fallback timeout to force exit if connections hang.

### Why Needed in Production

Ensures zero-downtime rolling deployments by permitting in-flight HTTP requests to complete cleanly before container shutdown, preventing database connection corruption.

---

## 6. Security Headers (Helmet)

### Implementation

- **File**: `apps/api/src/app.ts`
- **Configuration**:
  - `app.disable("x-powered-by")`: Hides Express runtime information.
  - HSTS (`Strict-Transport-Security`): Enforces HTTPS with 1-year max age (`maxAge: 31536000`).
  - X-Content-Type-Options: `nosniff` prevents MIME-type sniffing exploits.
  - X-Frame-Options: `sameorigin` prevents clickjacking framing attacks.
  - Referrer-Policy: `strict-origin-when-cross-origin`.

### Why Needed in Production

Mitigates common web application vulnerabilities (Clickjacking, MIME sniffing, Protocol Downgrade attacks) required for OWASP compliance.

---

## 7. Intelligent Response Compression

### Implementation

- **File**: `apps/api/src/app.ts`
- **Filters**:
  - Skips Server-Sent Events (`text/event-stream`).
  - Skips binary multipart file uploads (`multipart/form-data`).
  - Skips requests with `x-no-compression` header.

### Why Needed in Production

Reduces egress bandwidth overhead by up to 70% for JSON payloads while preventing streaming degradation or CPU overhead on binary file uploads.

---

## 8. Centralized CORS Policy

### Implementation

- **Package**: `@studenthub/config` (`getCorsConfig`) mounted in `apps/api/src/app.ts`.
- **Validation**: Dynamically checks inbound request origins against configured `CLIENT_URL` and `ALLOWED_ORIGINS`.

### Why Needed in Production

Prevents unauthorized third-party websites from making cross-origin API requests on behalf of authenticated users.

---

## 9. Environment Validation on Startup

### Implementation

- **File**: `apps/api/src/config/env.ts`
- **Behavior**: Uses Zod to parse `process.env`. If mandatory environment variables (`MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`) are missing or invalid, the application fails immediately with descriptive log output.

### Why Needed in Production

Prevents silent runtime crashes or unpredictable behavior midway through processing production requests due to missing configuration.
