# Mixed — Backend

Fastify REST API. Runs on AWS Lambda via `@fastify/aws-lambda`, or locally as a plain Node server.

## Stack

| | |
|---|---|
| Runtime | Node.js 20 + TypeScript |
| Framework | Fastify |
| Auth | Clerk (`@clerk/fastify`) |
| Database | PostgreSQL via Neon, Prisma ORM |
| AI | Anthropic Claude Haiku — NLP parsing + recommendations |
| Cache | Upstash Redis |
| Validation | Zod |
| Testing | Vitest |

## Dev setup

From the repo root:

```bash
npm install
```

Create `backend/.env`:
```
DATABASE_URL=postgresql://...
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
ANTHROPIC_API_KEY=sk-ant-...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
FRONTEND_URL=http://localhost:5173
```

```bash
npm run db:generate -w backend   # generate Prisma client after fresh clone
npm run db:migrate -w backend    # apply pending migrations
npm run dev -w backend           # http://localhost:3000
npm test -w backend
npm run build -w backend
```

## API routes

All routes except `/health` require a Clerk JWT in `Authorization: Bearer <token>`.

### Health
| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness check |

### User
| Method | Path | Description |
|---|---|---|
| GET | `/api/user` | Returns internal user ID for the authenticated Clerk user |

### Cabinet
| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/api/cabinet` | — | List owned ingredients |
| POST | `/api/cabinet` | `{ input: string }` | Add ingredients via NLP (Claude Haiku) |
| DELETE | `/api/cabinet/:id` | — | Remove a cabinet entry |
| GET | `/api/cabinet/can-make` | — | Cocktails you can make from your cabinet, sorted by match ratio |

### Cocktails
| Method | Path | Query | Description |
|---|---|---|---|
| GET | `/api/cocktails/search` | `?q=string` | Search cocktails by name, returns cabinet match context |

### Logs
| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/api/logs` | — | Drink history + stats (total, avg rating, top category) |
| POST | `/api/logs` | `{ cocktailId, rating?, notes? }` | Log a drink (rating 1–5, optional) |
| DELETE | `/api/logs/:id` | — | Delete a log entry |

## Project structure

```
src/
├── app.ts              # Fastify app factory
├── lambda.ts           # AWS Lambda entry point
├── server.ts           # Local dev entry point
├── routes/             # One file per feature domain (thin — shape only)
├── services/           # Business logic
└── lib/                # Prisma, Claude, Redis client singletons
prisma/
├── schema.prisma
└── migrations/
```

## Key design decisions

- **Services own logic** — routes handle request/response shape only. Services receive `userId` (internal), never raw tokens.
- **Redis cache** — Claude API calls are cached: ingredient parsing by raw input string, recommendations by user ID (~1hr TTL).
- **Auth scope** — `clerkPlugin` is registered only on a protected sub-app. `/health` is outside it.
- **Zod validation** — all request bodies validated before reaching service layer; errors return 400 with field detail.
