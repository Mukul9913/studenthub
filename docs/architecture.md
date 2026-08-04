# StudentHub Marketplace — Enterprise Architecture Documentation

## 1. Monorepo Structure & Workspace Topology

StudentHub is structured as an enterprise **Turborepo monorepo** managed with `pnpm` workspaces:

```
studenthub/
├── apps/
│   ├── api/             # Production Express.js REST API (Node 22 LTS)
│   └── web/             # React SPA (Vite + TypeScript + TailwindCSS)
├── packages/
│   ├── constants/       # Workspace shared domain constants & API route contracts
│   ├── types/           # Shared TypeScript interfaces & DTO definitions
│   ├── validation/      # Shared Zod validation schemas
│   ├── config/          # Environment parser, CORS, Cloudinary, JWT configuration
│   ├── utils/           # Shared utility functions
│   └── api-client/      # Strongly typed frontend API SDK
├── infra/
│   └── docker/          # Docker Compose production backend configurations
└── docs/                # Architecture & Observability documentation
```

---

## 2. Business Model & Revenue Engine

StudentHub is a **Marketplace Platform** connecting Students & Aspirants with Property & Library Owners across Indore.

- **Students & Aspirants**: Browse listings, search, filter, view galleries, and contact owners for **100% FREE** with zero broker fees.
- **Owners (Properties, Libraries, Mess, Local Services)**: Pay recurring SaaS subscriptions, listing promotions, verification audit fees, and marketing service add-ons.

### Subscription Plans (`PlanModel`, `SubscriptionModel`, `UsageModel`)

- **FREE**: 1 Active Listing, 25 Monthly Leads, Basic Dashboard.
- **STARTER (₹999/mo)**: 5 Active Listings, 100 Monthly Leads, 1 Featured Listing, Verified Owner Badge, Lead CSV Export.
- **PRO (₹2,499/mo)**: Unlimited Listings, Unlimited Leads, 3 Featured Listings, Homepage Banner, Priority 24/7 Support.
- **BUSINESS (₹4,999/mo)**: Custom Campaigns, Dedicated Account Manager, 10 Featured Listings, HD Photoshoot included.

### Add-on Revenue Streams

1. **Pay-Per-Lead Credits (`LeadPackageModel`)**: Credit bundles (10, 25, 50, 100 leads) for owners when monthly plan limit is reached.
2. **Featured & Sponsored Listings (`FeaturedListingModel`)**: High-visibility promoted placements for 7, 15, or 30 days.
3. **One-Time Marketing Services (`MarketingServiceModel`)**: HD Photoshoots, Instagram broadcasts to 50k+ Indore aspirants, and Local SEO Google Maps optimization.
4. **Verified Owner & Listing Badges (`VerificationModel`)**: Identity and property registration document auditing.

### Middleware Guards

- `subscriptionGuard`: Attaches active subscription and usage quotas to express request.
- `featureGuard(featureKey)`: Enforces feature capability permissions.
- `usageGuard(resource)`: Enforces active listing counts and monthly lead quotas.

---

## 3. Search & Discovery Engine Architecture

- **Provider Abstraction (`ISearchProvider`)**: Decoupled search interface allowing seamless hot-swapping between `MongoSearchProvider` and external search cluster providers (Typesense, Meilisearch, or Elasticsearch).
- **Search Capabilities**:
  - Compound MongoDB `$text` full-text search across Title, Description, Area, City, and Landmarks.
  - Geospatial `2dsphere` proximity search (`$nearSphere` / `$geoWithin`).
  - `$facet` aggregation pipelines for real-time filter counts.
  - Cursor-based base64 pagination for low latency.
- **Search Telemetry (`SearchAnalyticsModel`)**: Logs keyword queries, filter usage, result counts, and zero-result queries to identify unmet marketplace supply.

---

## 4. Listing Moderation & Lifecycle

Listings follow a strict moderation lifecycle state machine:

```
[DRAFT] ──> [PENDING_REVIEW] ──> [UNDER_REVIEW] ──> [APPROVED] (Publicly Visible)
                                        │
                                        └──> [REJECTED] / [SUSPENDED] / [ARCHIVED]
```

- Public APIs only serve `APPROVED` / `published` status listings.
- Every moderation action is recorded in `ModerationHistoryModel` with moderator audit trails and internal comments (`ModerationCommentModel`).

---

## 5. Lead Management Architecture

- **Supported Channels**: `DIRECT_ENQUIRY`, `VISIT_REQUEST`, `WHATSAPP_CLICK`, `CALL_CLICK`.
- **Owner CRM & Follow-Ups**: Status tracking (`NEW`, `CONTACTED`, `VISIT_SCHEDULED`, `CONVERTED`, `CLOSED`), follow-up scheduling (`FollowUpModel`), and event timeline logs (`LeadTimelineModel`).

---

## 6. Verification & Verification Standards

```bash
pnpm run format:check  # Prettier formatting verification
pnpm run lint          # ESLint zero-warning check
pnpm run typecheck     # TypeScript strict mode check
pnpm run build         # Production Turborepo build
pnpm --filter @studenthub/api test # 59/59 Automated integration tests
```
