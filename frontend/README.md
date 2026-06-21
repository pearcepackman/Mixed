# Mixed — Frontend

React + TypeScript PWA. Mobile-first, dark mode only.

## Stack

| | |
|---|---|
| Framework | React 19 + TypeScript, Vite |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Auth | Clerk (`@clerk/react` v6) |
| Icons | lucide-react |
| Font | Inter Variable |
| Testing | Vitest + Testing Library |

## Dev setup

From the repo root:

```bash
npm install
```

Create `frontend/.env`:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev -w frontend      # http://localhost:5173 (also exposed on local network)
npm test -w frontend
npm run build -w frontend
npm run lint -w frontend
```

## Pages

| Route | Description |
|---|---|
| `/` | Public landing — sign in / sign up |
| `/cabinet` | Manage owned ingredients (NLP input) |
| `/discover` | Browse cocktails, search, see what you can make |
| `/log` | Log and rate drinks, view personal history |
| `/profile` | Account info and stats |

## Key components

| Component | Purpose |
|---|---|
| `CocktailCard` | 3D flip card — front: image + badge, back: ingredients + instructions + log button |
| `BottomNav` | Fixed 4-tab nav — Cabinet · Discover · Log · Profile |
| `RatingStars` | 1–5 star rating, read-only or interactive |
| `PageHeader` | Consistent page title + optional action slot |
| `EmptyState` | Icon + title + description for empty lists |
| `IngredientChip` | Pill for ingredient names, `owned` or `missing` variant |

## Design system

- **Color tokens** — OKLCH CSS variables, warm stone/tan dark palette. See `src/index.css`.
- **Typography** — Inter, Tailwind default scale only (`text-sm` → `text-3xl`). One `text-2xl+` per screen.
- **Spacing** — Tailwind scale only. Page padding `px-4`, card gap `gap-4`, nav clearance `pb-20`.
- **Touch targets** — min 44px height on all interactive elements.
- **Animations** — Tailwind transition utilities only. No external animation libraries.
- **No arbitrary values** except CSS features Tailwind doesn't expose (e.g. `[perspective:1000px]` for 3D flip).
