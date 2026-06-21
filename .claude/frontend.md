# Frontend Design

## Design Tokens (CSS Variables)

shadcn/ui token system. All colors use OKLCH. Applied via Tailwind utility classes — never hardcode hex or rgb values.

### Light Mode

```css
--background: oklch(1 0 0);
--foreground: oklch(0.147 0.004 49.25);
--card: oklch(1 0 0);
--card-foreground: oklch(0.147 0.004 49.25);
--popover: oklch(1 0 0);
--popover-foreground: oklch(0.147 0.004 49.25);
--primary: oklch(0.508 0.118 165.612);
--primary-foreground: oklch(0.979 0.021 166.113);
--secondary: oklch(0.967 0.001 286.375);
--secondary-foreground: oklch(0.21 0.006 285.885);
--muted: oklch(0.97 0.001 106.424);
--muted-foreground: oklch(0.553 0.013 58.071);
--accent: oklch(0.97 0.001 106.424);
--accent-foreground: oklch(0.216 0.006 56.043);
--destructive: oklch(0.577 0.245 27.325);
--border: oklch(0.923 0.003 48.717);
--input: oklch(0.923 0.003 48.717);
--ring: oklch(0.709 0.01 56.259);
--radius: 0.625rem;
--sidebar: oklch(0.985 0.001 106.423);
--sidebar-foreground: oklch(0.147 0.004 49.25);
--sidebar-primary: oklch(0.596 0.145 163.225);
--sidebar-primary-foreground: oklch(0.979 0.021 166.113);
--sidebar-accent: oklch(0.97 0.001 106.424);
--sidebar-accent-foreground: oklch(0.216 0.006 56.043);
--sidebar-border: oklch(0.923 0.003 48.717);
--sidebar-ring: oklch(0.709 0.01 56.259);
```

### Chart Palette (both modes)

Green scale, light → dark:
```
--chart-1: oklch(0.845 0.143 164.978)   /* lightest */
--chart-2: oklch(0.696 0.17 162.48)
--chart-3: oklch(0.596 0.145 163.225)
--chart-4: oklch(0.508 0.118 165.612)
--chart-5: oklch(0.432 0.095 166.913)   /* darkest */
```

### Dark Mode Overrides

```css
--background: oklch(0.147 0.004 49.25);
--foreground: oklch(0.985 0.001 106.423);
--card: oklch(0.216 0.006 56.043);
--card-foreground: oklch(0.985 0.001 106.423);
--popover: oklch(0.216 0.006 56.043);
--popover-foreground: oklch(0.985 0.001 106.423);
--primary: oklch(0.432 0.095 166.913);
--primary-foreground: oklch(0.979 0.021 166.113);
--secondary: oklch(0.274 0.006 286.033);
--secondary-foreground: oklch(0.985 0 0);
--muted: oklch(0.268 0.007 34.298);
--muted-foreground: oklch(0.709 0.01 56.259);
--accent: oklch(0.268 0.007 34.298);
--accent-foreground: oklch(0.985 0.001 106.423);
--destructive: oklch(0.704 0.191 22.216);
--border: oklch(1 0 0 / 10%);
--input: oklch(1 0 0 / 15%);
--ring: oklch(0.553 0.013 58.071);
--sidebar: oklch(0.216 0.006 56.043);
--sidebar-foreground: oklch(0.985 0.001 106.423);
--sidebar-primary: oklch(0.696 0.17 162.48);
--sidebar-primary-foreground: oklch(0.262 0.051 172.552);
--sidebar-accent: oklch(0.268 0.007 34.298);
--sidebar-accent-foreground: oklch(0.985 0.001 106.423);
--sidebar-border: oklch(1 0 0 / 10%);
--sidebar-ring: oklch(0.553 0.013 58.071);
```

## Color Character

Primary is a mid-green (teal-adjacent). Background/foreground are warm near-whites and near-blacks with a slight amber undertone. Muted surfaces have a warm sand tone. The overall palette reads natural and earthy — fits the cocktail/ingredients theme.

## Typography

<!-- Add fonts here when decided -->

## Component Conventions

<!-- Add patterns here as they emerge — e.g. how cards are structured, icon usage, spacing scale, etc. -->

## Layout

- Mobile-first (PWA, installable)
- Full-screen layout assumed — no browser chrome fallback needed

## Typography

- **Font:** Inter — installed via `npm install @fontsource/inter`, imported in `main.tsx`
- **Scale:** Use Tailwind's default type scale only (`text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`). Never use arbitrary font sizes.
- **Weights:** `font-normal` for body, `font-medium` for labels and UI elements, `font-semibold` for headings. Never use `font-bold` except sparingly for emphasis.
- **Hierarchy rule:** Every screen should have exactly one `text-2xl` or larger element. Don't stack large headings.

## Component Conventions

### The golden rule
Before creating any new UI element, check `src/components/` first.
If a similar component exists, extend it via props rather than creating a new one.
If a shadcn/ui component covers the use case, use it rather than building from scratch.

### Icons
Use `lucide-react` exclusively. It is already installed with shadcn/ui.
Never use inline SVGs. Never import from heroicons or any other icon library.
Standard icon size is `size={20}` for UI icons, `size={16}` for inline/small contexts.

### Core reusable components
These components are the building blocks of the app.
They live in `src/components/` and must be used wherever applicable.

**CocktailCard** (`src/components/CocktailCard.tsx`)
Used in: search results, recommendations, what-can-I-make list, history feed.
Displays: cocktail image, name, key ingredients, user rating if available.
Never build an inline cocktail card — always use this component.

**IngredientChip** (`src/components/IngredientChip.tsx`)
Used in: cabinet display, cocktail detail ingredient list, recommendation context.
A small pill/tag showing a single ingredient name.
Variants: `owned` (full color), `missing` (muted/outlined).

**RatingStars** (`src/components/RatingStars.tsx`)
Used in: log entry form, cocktail detail, history list.
Props: `value` (1-5), `onChange` (optional — omit for read-only display).
Always use this — never build inline star ratings.

**BottomNav** (`src/components/BottomNav.tsx`)
The primary navigation. Fixed to bottom of screen.
Four tabs: Cabinet, Discover, Log, Profile.
Active tab uses primary color. Inactive uses muted-foreground.
This is the only navigation element — no top nav, no hamburger menu.

**PageHeader** (`src/components/PageHeader.tsx`)
Consistent top of each page. Props: `title`, optional `action` (right-side button).
Every page uses this. Never build one-off page headers inline.

**EmptyState** (`src/components/EmptyState.tsx`)
Used when a list has no items — empty cabinet, no results, no history yet.
Props: `icon`, `title`, `description`, optional `action` button.
Tone should be encouraging, not clinical. e.g. "Your cabinet is empty — time to stock up."

**LoadingSkeleton** (`src/components/LoadingSkeleton.tsx`)
Used while data is fetching. Matches the shape of the content it replaces.
Never use a spinner for list/card content. Use skeletons.
Spinners are only acceptable for form submission states.

### Spacing
Use Tailwind spacing scale only. Never arbitrary values like `p-[13px]`.
Standard page padding: `px-4` on mobile.
Standard gap between cards: `gap-4`.
Standard section spacing: `space-y-6`.

### Animations and transitions
Use Tailwind transition utilities only — `transition-colors`, `transition-opacity`, etc.
No custom CSS animations. No external animation libraries for v1.
Interactive elements should have `transition-colors duration-150` at minimum.

### Mobile-first rules
Design for 390px viewport width first. Desktop is secondary.
Touch targets minimum 44px height — use `min-h-[44px]` on interactive elements.
Bottom nav occupies ~64px — account for this with `pb-16` on page content.
Never rely on hover states as the only indicator of interactivity.

### Loading and error states
Every data-fetching component handles three states: loading, error, success.
Loading → skeleton. Error → inline error message with retry option. Success → content.
Never leave a component that fetches data without handling all three states.

### Forms
Use shadcn/ui Form components built on react-hook-form.
Zod schema for validation on every form — mirrors backend Zod schema where applicable.
Inline field-level error messages, not toast notifications, for validation errors.
Toast notifications (shadcn/ui Toaster) for async success/failure only — e.g. "Ingredient added", "Something went wrong."

## File and naming conventions

- Component files: PascalCase (`CocktailCard.tsx`)
- Hook files: camelCase prefixed with `use` (`useCabinet.ts`)
- Utility files: camelCase (`formatRating.ts`)
- One component per file. No barrel exports for components.
- Co-locate component-specific types in the same file unless shared across multiple components, in which case they live in `src/types/`.