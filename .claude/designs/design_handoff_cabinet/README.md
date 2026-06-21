# Handoff: Cabinet Screen (Mixed)

## Overview
The **Cabinet** is where a Mixed user tells the app which bottles/ingredients they own. They add ingredients via a freeform, plain-language text box (parsed server-side), and the parsed ingredients render as a 3-column grid of image cards. From this inventory the rest of the app determines which cocktails the user can make.

This handoff covers two states of the screen:
1. **Filled** — input area + populated 3-column ingredient grid.
2. **Empty (first-run)** — input area + an encouraging empty state.

## About the Design Files
The file in this bundle (`Mixed Cabinet.dc.html`) is a **design reference created in HTML** — a wireframe prototype showing the intended layout, copy, and behavior. It is **not production code to copy directly**.

The task is to **recreate this design inside the existing Mixed codebase** (React + Tailwind v4 + shadcn/ui, `lucide-react` icons, all colors via CSS variables) using that environment's established patterns. The HTML uses inline styles, hardcoded hex values, and hand-drawn SVG placeholders purely to communicate intent in isolation — none of that should ship. Map everything back onto the real design tokens and components.

The right-hand "notes" column and the phone bezel in the HTML are **annotation scaffolding only** — ignore them when implementing.

## Fidelity
**Low-fidelity (lofi) wireframe.** This shows structure, layout, hierarchy, copy, and flow. It deliberately uses dashed placeholders for the textarea and ingredient images, and a simplified warm palette. **Use it as a guide for layout and functionality, but apply the codebase's existing design system (the locked CSS-variable palette, Inter type scale, shadcn components, real radii) for styling.** Do not copy the inline hex values.

> Note on color: the wireframe's warm near-black + tan/brown accent was an open exploration. The canonical app palette is still the iOS-cool dark + green accent defined in the design context doc unless the team decides otherwise. **Use the app's real CSS variables (`bg-background`, `bg-card`, `text-primary`, etc.), not the wireframe hexes.**

## Screens / Views

### 1. Cabinet — Filled
- **Name:** Cabinet (filled)
- **Purpose:** User reviews their owned ingredients and adds/removes items.
- **Layout (top → bottom):**
  - Page header
  - Input area (textarea + right-aligned submit button)
  - Section label ("N ingredients")
  - 3-column ingredient grid
  - Fixed bottom nav (shell)
- **Components:**
  - **Page header:** `<h1>My Cabinet</h1>` — Inter, `text-2xl` (24px), `font-semibold`, foreground color, tight letter-spacing. Standard `px-4` page padding. One dominant heading per screen.
  - **Input textarea:** ~3 rows, `resize-none`, `rounded-md` (use app radius `0.625rem`), `border border-input`, `bg-background`, `text-sm`, `px-3 py-2`. Placeholder: *"What do you have? e.g. vodka, lime juice, triple sec, some rum…"*. Font-size 16px on the actual input to prevent iOS auto-zoom.
  - **Submit button (shadcn Button):** right-aligned below textarea. `bg-primary text-primary-foreground`, `rounded-md`, `px-5 py-2`, `text-sm font-medium`, min-height ~40–44px. Label **"Add to cabinet"**. Submitting state: label → **"Adding…"**, disabled, spinner (form-submission spinner is allowed per the spec).
  - **Section label:** small count line above the grid — **"12 ingredients"** — Inter, 12px, `font-medium`, `text-muted-foreground`. (This was corrected from a monospace style; it must use the standard Inter UI label style.)
  - **Ingredient grid:** `grid grid-cols-3 gap-3`. Each cell = `IngredientCard`:
    - Container: `rounded-xl border border-border bg-card p-3`, flex-column, centered, `gap-2`, `position: relative`.
    - **Image:** ingredient photo from TheCocktailDB CDN — `https://www.thecocktaildb.com/images/ingredients/{Name}-Small.png` — at `h-14 w-14 object-contain`. **Fallback:** if the image 404s, render an `h-14 w-14 rounded-full bg-muted` circle. (Wireframe shows a dashed circle placeholder labeled "img".)
    - **Name:** below image, `text-xs font-medium text-center capitalize`, foreground color, allow 2-line wrap.
    - **Remove button:** `X` icon (`lucide-react` `X`, `size={14}`), absolutely positioned top-right of the card, `text-muted-foreground`, min 24px tap area. Removes that ingredient on tap.
  - **Bottom nav:** see Shell section.

### 2. Cabinet — Empty (first-run)
- **Name:** Cabinet (empty state)
- **Purpose:** Encourage a brand-new user to populate their cabinet.
- **Layout:** Same header + input area as filled, then the grid region is replaced by a centered empty state filling the remaining space.
- **Components:**
  - Header, textarea, and submit button: identical to filled state.
  - **EmptyState** (centered, vertical, `gap-3`, max-width ~250px, text-centered):
    - **Icon:** `lucide-react` `FlaskConical`, ~`size={30}`, in `text-primary`, inside a ~64px circle (`rounded-full`, muted/dashed surface). 
    - **Headline:** **"Your cabinet's looking thirsty"** — `text-base` (16px), `font-medium`, foreground.
    - **Subtext:** **"Tell us what you've got on the shelf and we'll show you what you can pour."** — `text-sm`, `text-muted-foreground`, relaxed line-height.
    - **Nudge (optional):** a small "↑ type a few bottles up there" hint pointing back to the input. This is wireframe flavor — implement as a subtle helper line or omit; the team's call.

> Reuse the spec'd `EmptyState` component (`icon`, `title`, `description`, optional `action`). Here there's no CTA button because the input is right above it.

## Shell (shared — already exists as `BottomNav`)
- Fixed bottom nav, 64px tall, `border-t`, 4 tabs evenly spaced: **Cabinet · Discover · Log · Profile**.
- Each tab: `lucide-react` icon (`size={20}`) above a label (`text-xs`, ~11px, `font-medium`).
  - Cabinet → `FlaskConical`, Discover → `Compass`, Log → `BookOpen`, Profile → `User`.
- Active tab = `text-primary` (with a subtle ~`bg-primary/15` rounded pill behind the icon, as drawn). Inactive = `text-muted-foreground`.
- Page content uses `pb-20` (80px) to clear the nav.

## Interactions & Behavior
- **Add ingredients:** user types freeform text → taps **Add to cabinet** → text sent to the existing parse endpoint (NLP) → returns structured ingredient names → appended to the grid. Button shows **"Adding…"** + disabled while in flight.
- **Remove ingredient:** tap the `X` on a card → removes it (optimistic update is fine; reconcile with server).
- **Image fallback:** on `<img>` `onError`, swap to the muted circle fallback.
- **States (handle all three):**
  - *Loading* (initial cabinet fetch): skeleton grid cells (`animate-pulse`, card-shaped), not a spinner.
  - *Error*: inline error message with a retry affordance.
  - *Success/empty*: render grid, or the empty state if the cabinet has zero ingredients.
- **Transitions:** `transition-colors duration-150` minimum on interactive elements (button, remove icon, nav).

## State Management
- `ingredients: string[]` (or `{ name }[]`) — the user's cabinet.
- `inputText: string` — textarea value.
- `isAdding: boolean` — submit in-flight (drives "Adding…" + disabled).
- `isLoading: boolean` / `error` — for the initial fetch.
- Derived: `isEmpty = ingredients.length === 0` → toggles empty state vs grid.
- Data: fetch cabinet on mount; POST freeform text to parse endpoint on add; DELETE/PATCH on remove.

## Design Tokens
**Use the codebase's existing tokens — these are the canonical references, not the wireframe hexes.**
- **Colors:** `--background`, `--card`, `--primary` / `--primary-foreground`, `--muted` / `--muted-foreground`, `--border`, `--input`, `--destructive`. All via Tailwind utilities (`bg-card`, `text-muted-foreground`, …). Never hardcode hex.
- **Radius:** `0.625rem` base. `rounded-md` for input/button, `rounded-xl` for ingredient cards.
- **Spacing:** page padding `px-4`; card grid `gap-3`; section spacing `space-y-6`; nav clearance `pb-20`. Tailwind scale only — no arbitrary pixel values.
- **Typography (Inter):** `text-2xl font-semibold` heading; `text-base font-medium` empty-state headline; `text-sm` body/subtext; `text-xs font-medium` ingredient names & section label & nav labels. Weights: `font-normal` body, `font-medium` labels/buttons, `font-semibold` headings.
- **Touch targets:** min 44px height on interactive elements.

## Assets
- **Ingredient images:** TheCocktailDB CDN — `https://www.thecocktaildb.com/images/ingredients/{Name}-Small.png`. Fallback to a muted circle on 404.
- **Icons:** `lucide-react` only — `FlaskConical` (cabinet/empty icon + nav), `Compass`, `BookOpen`, `User` (nav), `X` (remove + clear). No inline SVGs in production.

## Files
- `Mixed Cabinet.dc.html` — the wireframe prototype (both states side by side, plus annotation column). Open in any browser to see the intended layout. Reference only; do not ship.
