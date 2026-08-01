# StudentHub — Premier Student & Aspirant Platform

![CI Pipeline](https://github.com/Mukul9913/studenthub/actions/workflows/ci.yml/badge.svg)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-purple.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.x-orange.svg)](https://pnpm.io/)

> **Launch Market:** Indore, Madhya Pradesh, India.
> High-performance MERN Monorepo for Student Accommodations (PGs/Hostels), 24x7 Silent Study Libraries, Mess Tiffins, and Local Utilities.

---

## 🚀 Key Features & Architectural Highlights

- **Public Discovery Module**: Advanced search & filtering across Indore localities (Bhawarkua, Vijay Nagar, Geeta Bhawan, Zensar) with URL query state synchronization.
- **Listing Moderation**: Admin portal listing review queue with image lightbox viewer, status approval workflows, and owner verification.
- **Lead & Inquiry System**: Direct student-to-owner enquiry pipeline with student contact details (Phone, Call, Email, WhatsApp).
- **Interactive OpenAPI 3 (Swagger)**: Complete, production-ready API documentation exposed at `/api/docs` and `/api/openapi.json`.
- **Structured Pino Logging**: ISO-timestamped JSON logs in production, pretty-printed in development, request correlation IDs (`X-Request-ID`), and slow request monitoring (>500ms).
- **Centralized Error Architecture**: Operational `AppError` hierarchy (`ValidationError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, `TooManyRequestsError`).
- **Security Hardening**: Production-ready Helmet security headers, Trust Proxy configuration, environment-driven CORS, and modular rate limiting.

---

## 🏗️ Monorepo Structure

```text
studenthub/
├── .github/
│   └── workflows/
│       └── ci.yml               # Production GitHub Actions CI Pipeline
├── apps/
│   ├── api/                     # Node.js + Express + MongoDB REST API
│   │   ├── src/
│   │   │   ├── config/          # Environment configuration (Zod validation)
│   │   │   ├── controllers/     # HTTP Request Handlers
│   │   │   ├── docs/            # OpenAPI 3 Spec & Swagger UI Router
│   │   │   ├── errors/          # AppError class hierarchy & categories
│   │   │   ├── middlewares/     # Auth, Validation, Error, Rate Limiter, Logger
│   │   │   ├── models/          # Mongoose Schemas & Data Models
│   │   │   ├── repositories/    # Database Data Access Layer
│   │   │   ├── routes/          # Express Routers
│   │   │   ├── services/        # Business Logic Layer
│   │   │   └── utils/           # Pino Logger & Async Handlers
│   └── web/                     # React 18 + Vite + Tailwind CSS Frontend
├── packages/
│   └── types/                   # Shared TypeScript Data Contracts (@studenthub/types)
├── docs/                        # Architecture & Domain Specifications
├── turbo.json                   # Turborepo Build Pipeline Task Definitions
├── pnpm-workspace.yaml          # Monorepo Workspace Configuration
└── .env.example                 # Environment Variable Schema & Examples
```

---

## 🛠️ Tech Stack

| Layer                 | Technologies                                                      |
| --------------------- | ----------------------------------------------------------------- |
| **Monorepo Tooling**  | Turborepo + pnpm Workspaces                                       |
| **Backend Runtime**   | Node.js 22+, Express 4, TypeScript 5, Mongoose 8, MongoDB         |
| **Validation & Docs** | Zod, OpenAPI 3.0, Swagger UI Express                              |
| **Observability**     | Pino, Pino HTTP, Pino Pretty (Request Tracing & Latency Auditing) |
| **Frontend UI**       | React 18, Vite 6, Tailwind CSS, Lucide Icons, React Router 6      |
| **Code Quality**      | ESLint 9 (Flat Config), Prettier, Husky, lint-staged, Commitlint  |

---

## ⚙️ Prerequisites & Installation

### Prerequisites

- **Node.js**: `>= 22.0.0`
- **pnpm**: `>= 9.0.0` (`corepack enable` recommended)
- **MongoDB**: Running locally (`mongodb://127.0.0.1:27017`) or Atlas connection URI

### Step-by-Step Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Mukul9913/studenthub.git
   cd studenthub
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

---

## 💻 Development Commands

```bash
# Run all workspaces in parallel (API + Web Client + Watchers)
pnpm dev

# Build all monorepo workspaces
pnpm build

# Run TypeScript typecheck across all workspaces
pnpm typecheck

# Run ESLint check across all workspaces
pnpm lint

# Check code formatting with Prettier
pnpm format:check

# Run unit & integration test suite
pnpm test
```

### Workspace-Specific Commands

```bash
# Run API service independently
pnpm --filter @studenthub/api dev

# Run Web frontend independently
pnpm --filter @studenthub/web dev

# Run API test suite
pnpm --filter @studenthub/api test
```

---

## 🔗 Endpoint References

- **Web Application**: [http://localhost:5173](http://localhost:5173)
- **API Health Endpoint**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Interactive Swagger UI**: [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
- **OpenAPI JSON Spec**: [http://localhost:5000/api/openapi.json](http://localhost:5000/api/openapi.json)

---

## 🚦 CI/CD Pipeline

The project uses **GitHub Actions** (`.github/workflows/ci.yml`) to automatically validate every `push` and `pull_request` on `main`, `master`, and `dev` branches:

1. Dependency Installation & Cache Restoration (`pnpm install --frozen-lockfile`)
2. Code Formatting Verification (`pnpm run format:check`)
3. ESLint Rules Check (`pnpm run lint`)
4. TypeScript Strict Compilation (`pnpm run typecheck`)
5. Workspace Build Verification (`pnpm run build`)
6. API Unit & Integration Testing (`pnpm --filter @studenthub/api test`)

---

## 🗺️ Future Roadmap

- [ ] **Containerization**: Dockerfile & docker-compose for multi-stage production deployments.
- [ ] **Observability Exporters**: Direct log shipping to Datadog / Better Stack / Grafana Loki via Pino transports.
- [ ] **Multi-City Expansion**: Geolocation spatial indexing for Pune, Kota, and Bengaluru launch hubs.
- [ ] **Payment Gateway**: Integration of Razorpay/UPI subscriptions for property & library owners.

---

## 📜 License

Proprietary — **StudentHub**. All rights reserved.
