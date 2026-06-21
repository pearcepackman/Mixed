@.claude/frontend.md

# Mixed

Cocktail tracking and discovery app — Goodreads for cocktails. Users log drinks, rate them, manage a cabinet inventory, and get AI-powered recommendations based on what they own. Social layer is V2; solo experience is fully useful standalone.

**Name is Mixed. Use this consistently — repo, comments, UI copy, variable names.**

## Stack

| Layer | Tech |
|---|---|
| Frontend | React + TypeScript, Vite, Tailwind, shadcn/ui, vite-plugin-pwa |
| Backend | Fastify + Node.js + TypeScript, Zod validation, @fastify/aws-lambda |
| Auth | Clerk (JWT middleware on protected routes) |
| Database | PostgreSQL via Neon, Prisma ORM |
| AI | Claude API — model `claude-haiku-4-5` — cabinet NLP parsing + recommendations only |
| Cache | Upstash Redis |
| Infra | AWS Lambda + Function URLs, S3 + CloudFront, EventBridge warmup ping |
| CI/CD | GitHub Actions — CI on every push, CD on main merge |
| Data | TheCocktailDB ingested into local Postgres via seed script, weekly sync via GH Actions cron |

## Repo Structure

```
mixed/
├── frontend/
│   └── src/
│       ├── components/ui/     # shadcn/ui components
│       ├── pages/
│       ├── hooks/
│       ├── lib/
│       └── types/
├── backend/
│   ├── src/
│   │   ├── routes/            # One file per feature domain
│   │   ├── services/          # Business logic (keep out of routes)
│   │   ├── lib/               # Prisma, Claude, Redis clients
│   │   ├── middleware/
│   │   └── types/
│   ├── lambda.ts              # @fastify/aws-lambda entry point
│   └── prisma/
│       ├── schema.prisma
│       └── migrations/
└── .github/workflows/
    ├── ci.yml
    └── cd.yml
```

## Routing

`App.tsx` owns the `BrowserRouter`. Routes are defined in `AppRoutes.tsx` so tests can wrap them in `MemoryRouter` without nesting conflicts. Protected routes use `ProtectedRoute` (`src/components/ProtectedRoute.tsx`) which checks `useAuth()` and redirects to `/` if not signed in.

```
/           → Home (public)
/cabinet    → Cabinet management (protected)
/profile    → Profile (protected)
/cocktails  → Cocktail search/browse (protected)
```

## Key Patterns

**Logic separation** — business logic lives in `services/`, not route handlers. Routes own request/response shape only. Services receive user ID, never raw tokens.

**AI usage** — Claude is called in exactly two places: cabinet ingredient parsing and recommendation generation. Always check Redis cache before calling the API. Cache parsing results by raw input string; cache recommendations by user ID with ~1 hour TTL.

**Auth** — `clerkPlugin` from `@clerk/fastify` is scoped to a protected sub-app in `app.ts`; public routes like `/health` are registered outside it. On the frontend, use `Show` from `@clerk/react` (v6 replacement for `SignedIn`/`SignedOut`) with `ClerkProvider` using the shadcn theme from `@clerk/ui`. Services receive the user ID from `getAuth(request)`, never the raw token.

**Error handling** — Fastify built-in error handler + custom plugin for consistent response shape. Zod validation errors → 400 with field-level detail.

**Environment variables** — never commit secrets. Required: `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `ANTHROPIC_API_KEY`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `FRONTEND_URL` (CORS origin, defaults to `http://localhost:5173`).

## V1 Scope

- Auth (Clerk)
- Cabinet management (NLP ingredient input → structured data via Claude)
- "What can I make" — cabinet vs. recipe matching
- Cocktail detail view
- Log and rate a drink
- Personal history
- AI recommendations
- TheCocktailDB seed + weekly sync

## V2 (design schema to support, do not build)

- Friend activity feed (Socket.io + Redis pub/sub)
- Follows / social graph
- Taste profiles and comparisons
- Community ratings
- Shopping list

## Architecture Rationale (for interviews)

- **Lambda over EB** — no always-on cost, Function URLs eliminate API Gateway, EventBridge ping mitigates cold starts
- **Neon over RDS** — RDS free tier is 12-month only; Lambda + RDS needs RDS Proxy (paid). Neon is serverless-native, handles connection pooling, permanent free tier
- **Upstash over ElastiCache** — ElastiCache needs VPC + NAT Gateway (~$33/mo). Upstash is external REST API, per-request pricing, free at low traffic
- **Fastify over Express** — Express is largely unmaintained; Fastify has active development, native TS support, better perf
- **Vitest over Jest** — uses Vite's transform pipeline, no extra TS config, consistent toolchain across frontend and backend
- **PWA over React Native** — faster to ship, no App Store friction for v1

## Still Undecided

- Prisma schema
- API route structure
- UI design details
- TheCocktailDB sync strategy
