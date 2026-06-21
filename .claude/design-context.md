# Mixed — Frontend Design Context

## What the app is

Mixed is a cocktail tracking and discovery app — Goodreads for cocktails. Users log drinks, rate them, manage a cabinet of ingredients they own, and see what cocktails they can make from it. Mobile-first PWA, dark mode only for now.

---

## Design decisions already locked in

### Dark mode only
`<html class="dark">` is hardcoded. There is no light/dark toggle. The app is dark mode permanently.

### Color palette — iOS-inspired dark
Background and card colors were deliberately matched to iOS system UI dark mode:
- `--background: oklch(0.155 0.002 270)` ≈ iOS `#1C1C1E` (near-black with a very subtle cool undertone)
- `--card: oklch(0.205 0.003 270)` ≈ iOS `#2C2C2E` (slightly lifted surface)
- Primary is a mid-green (teal-adjacent): `oklch(0.432 0.095 166.913)` in dark mode

The overall palette reads clean and premium — not green-heavy, just green-accented. Think native iOS with a teal-green accent.

### Typography — Inter
Inter Variable loaded via `@fontsource-variable/inter`. Applied globally via `font-family: 'Inter', sans-serif` on body. Scale is Tailwind defaults only (`text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`). Weights: `font-normal` body, `font-medium` labels, `font-semibold` headings. No `font-bold` except sparingly. One `text-2xl+` element per screen max.

### Navigation — BottomNav only
Fixed bottom nav, 4 tabs: Cabinet · Discover · Log · Profile. No top nav, no hamburger. This is the only nav element.

Tabs use `lucide-react` icons (standard size `size={20}` for nav, `size={16}` for inline). Active tab = `text-primary`. Inactive = `text-muted-foreground`.

Current tabs:
| Tab | Route | Icon |
|---|---|---|
| Cabinet | `/cabinet` | `FlaskConical` |
| Discover | `/discover` | `Compass` |
| Log | `/log` | `BookOpen` |
| Profile | `/profile` | `User` |

### Mobile-first rules (locked)
- 390px viewport first
- Touch targets min 44px height (`min-h-[44px]`)
- Bottom nav is 64px — page content uses `pb-20` (80px) to clear it
- `px-4` standard page padding
- `viewport-fit=cover` for notch support
- `interactive-widget=resizes-visual` so keyboard doesn't shrink layout
- `maximum-scale=1.0` + `font-size: 16px` on all inputs to prevent iOS auto-zoom

### CocktailCard — flip animation
The main card component is a 3D flip card. Front shows full-bleed image with a bottom gradient fade, cocktail name, ingredient count, and a can-make badge (green check / amber flask / red X). Flip reveals a scrollable back with ingredients (owned vs missing colored differently) and instructions.

Flip uses CSS 3D: `[perspective:1000px]`, `[transform-style:preserve-3d]`, `[backface-visibility:hidden]`, `transition-transform duration-500`. Gradient is inline `style` (Tailwind v4 gradient + opacity utilities were unreliable). Card height is `h-64`.

### Spacing
- Page padding: `px-4`
- Card gap: `gap-4`
- Section spacing: `space-y-6`
- Tailwind scale only — no arbitrary pixel values

### Animations
Tailwind transition utilities only. `transition-colors duration-150` minimum on interactive elements. No external animation libraries.

### Icons
`lucide-react` exclusively. No inline SVGs, no heroicons. `size={20}` for UI icons, `size={16}` for inline/small.

### Error / loading pattern
- Loading → skeletons (not spinners) for list/card content
- Spinners only for form submission states
- Error → inline error message with retry
- Always handle all three states: loading, error, success

---

## Component inventory

### Built and working
| Component | File | Notes |
|---|---|---|
| `CocktailCard` | `src/components/CocktailCard.tsx` | Full flip card, reusable, used in Discover |
| `IngredientChip` | `src/components/IngredientChip.tsx` | Pill for ingredient names. Variants: `owned` (green tint), `missing` (outlined). Has optional `onRemove`. **Not currently used in Cabinet — Cabinet has its own image-based IngredientCard inline.** |
| `BottomNav` | `src/components/BottomNav.tsx` | Fixed, 4 tabs, fully functional |
| `ProtectedRoute` | `src/components/ProtectedRoute.tsx` | Auth guard |
| `button` | `src/components/ui/button.tsx` | shadcn/ui Button |

### Specified in design doc but not built
| Component | Notes |
|---|---|
| `PageHeader` | Every page should use this. Props: `title`, optional `action` (right-side button). Currently every page rolls its own `<h1>`. |
| `EmptyState` | Props: `icon`, `title`, `description`, optional `action`. Should feel encouraging. Currently both Cabinet and Discover have inline empty states. |
| `LoadingSkeleton` | Skeleton that matches content shape. Currently Discover uses inline `animate-pulse` divs, Cabinet uses inline pill skeletons. |
| `RatingStars` | Props: `value` (1–5), `onChange?` (omit = read-only). Needed for Log feature. |

---

## Page inventory

### `/` — Home
Very bare — just "Mixed / Track your cocktails" with Sign In / Sign Up buttons (Clerk modal). Signed-in state just shows "You're signed in" and a profile button. Needs a real landing design but not a priority since users go straight to `/cabinet` after auth.

### `/cabinet` — Cabinet

**Top:** `<h1 class="text-2xl font-semibold mb-6">My Cabinet</h1>`

**Input area:** A `<textarea>` (3 rows, `rounded-md border border-input bg-background px-3 py-2 text-sm`, `resize-none`) with placeholder "What do you have? e.g. vodka, lime juice, triple sec, some rum…". Below it, a right-aligned "Add to cabinet" button (`bg-primary text-primary-foreground rounded-md px-5 py-2 text-sm font-medium`). When submitting it says "Adding…" and disables.

**Ingredient grid:** 3-column grid (`grid grid-cols-3 gap-3`). Each cell is a card (`rounded-xl border border-border bg-card p-3`) containing:
- A small ingredient image from TheCocktailDB CDN (`https://www.thecocktaildb.com/images/ingredients/{Name}-Small.png`) at `h-14 w-14 object-contain`. Falls back to a `h-14 w-14 rounded-full bg-muted` circle if the image 404s.
- The ingredient name below (`text-xs font-medium text-center capitalize`).
- A small `X` button (`size={14}`) in the top-right corner of the card, absolutely positioned, `text-muted-foreground`, on tap removes that ingredient.

**Empty state (inline):** Centered text — "Your cabinet is empty" (`text-base font-medium`) + "Tell us what you have and we'll show you what you can make." (`text-sm text-muted-foreground`). No icon currently.

**Open design decision:** Keep the image-based grid cards (looks nice, shows bottle/ingredient photos) or switch to `IngredientChip` pills (spec says chips, grid is custom). Currently leaning toward keeping the image cards since they look better and are already working.

---

### `/discover` — Discover

**Top:** `<h1 class="text-2xl font-semibold mb-4">Discover</h1>`

**Search bar:** Full-width input with a `Search` icon (`size={16}`) pinned left inside the input and an `X` button (`size={16}`) pinned right to clear. Styled `rounded-xl border border-input bg-card py-2.5 pl-9 pr-9 text-sm`. No search button — debounced 300ms, searches on type.

**Tabs (shown when not searching):** Three pill buttons in a horizontal row, wrappable. Labels: "Can make (N)", "Missing 1 (N)", "Missing 2 (N)". Active tab = `bg-primary text-primary-foreground rounded-full px-3 py-1`. Inactive = `bg-muted text-muted-foreground`. Switching tabs filters the already-loaded can-make list client-side.

**Card list:** Vertical, `flex flex-col gap-4`. Each card is a `CocktailCard` (see below).

**Empty state (inline):** Centered — "No cocktails found" / "Nothing here yet" with a contextual sub-line.

**Loading state:** Three `h-64 animate-pulse rounded-2xl bg-muted` skeleton blocks.

---

### CocktailCard — detailed anatomy

Height is fixed `h-64`. Full width. `rounded-2xl`. Tapping anywhere flips it.

**Front face:**
- Full-bleed cocktail photo (`object-cover h-full w-full`). Falls back to `bg-muted` if no image.
- Bottom gradient overlay (inline style): `linear-gradient(to top, rgba(0,0,0,0.88), rgba(0,0,0,0.5) 50%, transparent)` — covers the bottom ~96px (`h-24`).
- Over the gradient, bottom-left: cocktail name in `text-base font-semibold text-white`, below it `{ownedCount}/{totalCount} ingredients` in `text-xs text-white/70`.
- Bottom-right: a small circular badge (`rounded-full p-1.5`) with a `size={14}` icon. Three states:
  - All ingredients owned → green (`bg-green-500`) + `Check` icon
  - Missing 1–2 → amber (`bg-amber-500`) + `FlaskConical` icon
  - Missing 3+ → red (`bg-red-500`) + `X` icon
- Badge only shows if cabinet context was passed (optional props).

**Back face:**
- `bg-card` surface with `border border-border`, `rounded-2xl`, `p-4`, `overflow-y-auto`.
- Cocktail name again (`text-base font-semibold`).
- Meta line below: "Category · Glass · Non-alcoholic" joined by ` · ` in `text-xs text-muted-foreground`.
- Ingredient list: each row `flex justify-between text-xs`. Ingredient name left (`capitalize`; owned = normal foreground, not-owned = `text-muted-foreground`). Measure right (`text-muted-foreground`).
- Instructions below ingredients: `text-xs text-muted-foreground leading-relaxed`.

---

### `/log` — Log
Route exists in nav but the page hasn't been built. Will be: find a cocktail, rate it 1–5 stars, optional note, save to drink history.

### `/profile` — Profile
Placeholder / debug view. Has Clerk `UserButton` and a "Fetch user from API" debug button. Needs a real design: avatar, username, drink count stats, recent history, sign out.

---

## What's next design-wise

Priority order:
1. Build `PageHeader`, `EmptyState`, `LoadingSkeleton` — apply across all pages for consistency
2. Decide: keep image IngredientCard in Cabinet or switch to IngredientChip (or both — chip in some places, image card in Cabinet)
3. Build `RatingStars`
4. Build Log page (the whole flow: search cocktail → rate → save)
5. Make Profile real
6. Polish Home landing screen

---

## Tech notes for Claude Design

- Tailwind v4 — use standard utilities. Arbitrary values like `[perspective:1000px]` are OK for CSS features Tailwind doesn't expose. Avoid arbitrary pixel spacing.
- shadcn/ui components are available — check `src/components/ui/` before building from scratch
- All colors via CSS variables (`bg-primary`, `text-muted-foreground`, etc.) — never hardcode hex or rgb
- `lucide-react` for all icons
- Forms use `react-hook-form` + Zod + shadcn Form components
- Toast notifications (shadcn Toaster) for async success/failure only; validation errors are inline field-level
