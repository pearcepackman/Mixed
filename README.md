<p align="left">
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Fastify-000000?style=flat&logo=fastify&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/AWS_Lambda-FF9900?style=flat&logo=awslambda&logoColor=white" />
  <img src="https://img.shields.io/badge/Clerk-6C47FF?style=flat&logo=clerk&logoColor=white" />
  <img src="https://img.shields.io/badge/Claude_AI-D97757?style=flat&logo=anthropic&logoColor=white" />
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=flat&logo=pwa&logoColor=white" />
</p>

# Mixed

Hello! I'm Pearce, and Mixed is a cocktail tracking and discovery app — think Goodreads, but for your liquor cabinet. Log drinks you've made, rate them, manage your ingredient inventory, and get AI-powered recommendations based on what you actually own.

The solo experience works great on its own. A social layer activates when you add friends — activity feeds, taste comparisons, and community discovery.

## Tech Stack

**Frontend**
- **React + TypeScript** — UI built with Vite, mobile-first PWA
- **Tailwind CSS + shadcn/ui** — styling and accessible component primitives
- **Clerk** — authentication and session management

**Backend**
- **Fastify + Node.js + TypeScript** — REST API with Zod schema validation
- **Prisma + PostgreSQL (Neon)** — ORM and serverless-native database
- **Claude API (Haiku)** — natural language cabinet input parsing and drink recommendations
- **Upstash Redis** — response caching for AI calls

**Infrastructure**
- **AWS Lambda + Function URLs** — serverless backend, no API Gateway needed
- **AWS S3 + CloudFront** — frontend hosting and CDN
- **GitHub Actions** — CI on every push, CD to Lambda + S3 on main merge

## Features

**V1 (current)**
- Cabinet management with natural language input — "I have Hendricks, Campari, and sweet vermouth" gets parsed into structured ingredients
- "What can I make" — matches your cabinet against the full recipe database
- Cocktail detail view with ingredients, instructions, and ratings
- Log and rate drinks you've made
- Personal history feed
- AI-powered recommendations based on your cabinet and taste history
- Full cocktail database seeded from TheCocktailDB

**V2 (planned)**
- Friend activity feed with real-time updates
- Social graph and follows
- Taste profile comparisons
- Community ratings
- Shopping list — "get these 3 bottles and unlock 47 new drinks"

## Local Development

**Prerequisites:** Node.js 20+, a [Neon](https://neon.tech) PostgreSQL database, a [Clerk](https://clerk.com) app, and an [Anthropic](https://console.anthropic.com) API key.

```bash
git clone https://github.com/pearcepackman/Mixed
cd mixed
npm install
```

Create `backend/.env`:
```
DATABASE_URL=your_neon_connection_string
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
ANTHROPIC_API_KEY=sk-ant-...
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
FRONTEND_URL=http://localhost:5173
```

Create `frontend/.env`:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:3000
```

```bash
npm run db:generate -w backend  # generate Prisma client (required after fresh clone)
npm run db:migrate -w backend   # apply migrations
npm start                        # starts frontend (:5173) and backend (:3000) concurrently
```

## Architecture Notes

**Why Lambda over a traditional server** — traffic doesn't justify always-on infrastructure at portfolio scale. Lambda Function URLs eliminate API Gateway costs, and an EventBridge warmup ping every 10 minutes keeps cold starts from being noticeable.

**Why Neon over RDS** — RDS free tier is 12-month credits only, and Lambda needs RDS Proxy to avoid connection exhaustion (an extra paid service). Neon is serverless-native, handles connection pooling out of the box, and has a permanent free tier.

**Why Fastify over Express** — Express is largely unmaintained. Fastify has active development, built-in TypeScript support, and schema validation that pairs cleanly with Zod.

## Screenshots

*Coming soon — in active development*

## Contact

<p align="center">
  <a href="https://pearcepackman.com/" target="_blank">🌐 Portfolio</a> |
  <a href="https://www.linkedin.com/in/pearce-packman/" target="_blank">🔗 LinkedIn</a> |
  <a href="mailto:pearcepackman@gmail.com">📧 Email</a>
</p>
