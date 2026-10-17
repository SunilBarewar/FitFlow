# FitFlow Design System

> **The canonical reference for all UI work on FitFlow.** Every developer, designer, and coding agent building UI must read this document before writing code. The companion Cursor rules (`.cursor/rules/design-system.mdc` and `.cursor/rules/ux-ui-first.mdc`) enforce these principles automatically.

---

## 1. Philosophy

FitFlow sits at the intersection of **coaching warmth** and **product clarity**. The interface should feel like a knowledgeable, encouraging personal trainer — not a medical form or a generic fitness tracker.

### Core design values

| Value | What it means in the UI |
|---|---|
| **Warmth** | Rounded shapes, generous whitespace, encouraging copy, celebratory moments |
| **Clarity** | One primary action per screen, strong visual hierarchy, no cognitive clutter |
| **Energy** | Vibrant primary green, coral accents, purposeful motion |
| **Trust** | Consistent patterns, predictable behavior, visible memory of user choices |
| **Speed** | Instant feedback, optimistic updates, skeleton loaders, zero lag feel |

---

## 2. Brand Color Palette

FitFlow uses **OKLCH** perceptual color space throughout. This ensures consistent perceived brightness across the palette and clean dark mode handling.

### Primary — FitFlow Green

The signature color. Used for primary CTAs, active states, progress indicators, and brand moments.

```
Light: oklch(0.57 0.20 148)   ≈ #16a34a  (vibrant fitness green)
Dark:  oklch(0.66 0.21 148)   ≈ #22c55e  (brighter in dark mode)
```

Light tint (for surfaces): `var(--brand-green-light)` → `oklch(0.93 0.07 148)`

### Accent — Motivational Coral

Used for energy moments, streaks, warnings-that-aren't-errors, and emotional highlights.

```
Light: oklch(0.70 0.16 30)    ≈ #ea580c  (warm coral-orange)
Dark:  oklch(0.72 0.16 30)    ≈ #f97316
```

Light tint: `var(--brand-coral-light)` → `oklch(0.95 0.05 30)`

### Brand Navy

Used for high-contrast text on light surfaces, dark backgrounds, and premium UI moments.

```
oklch(0.18 0.04 255)          ≈ #0f172a
```

### Brand Sky

Used for informational cards, calm states, hydration/recovery contexts.

```
Light: oklch(0.65 0.14 220)   ≈ #0284c7
Light tint: oklch(0.93 0.04 220)
```

### Semantic Color Map

| CSS Variable | Light Value | Dark Value | Use |
|---|---|---|---|
| `--background` | Near-white warm | Deep navy | Page background |
| `--foreground` | Deep navy | Soft warm white | Body text |
| `--card` | Pure white | Navy+1 level | Card surfaces |
| `--primary` | Brand green | Brighter green | Primary actions |
| `--secondary` | Green-tinted surface | Navy surface | Chip backgrounds |
| `--muted` | Cool light gray | Dark gray | Disabled, fills |
| `--muted-foreground` | Medium gray | Light gray | Captions, hints |
| `--accent` | Coral-orange | Warm orange | Highlights |
| `--destructive` | Red | Lighter red | Errors, danger |
| `--border` | Light green-tinted | Translucent white | Dividers, outlines |
| `--ring` | Matches primary | Matches primary | Focus outlines |

### Chart Palette (in order)
1. `--chart-1` — Green (primary metric, reps, volume)
2. `--chart-2` — Coral (calories, effort, energy)
3. `--chart-3` — Blue (heart rate, recovery, hydration)
4. `--chart-4` — Purple (sleep, mobility, flexibility)
5. `--chart-5` — Amber (consistency, streaks, adherence)

### Status Colors

| Token | Purpose |
|---|---|
| `--success` / `--success-foreground` | Workout completed, goal reached |
| `--warning` / `--warning-foreground` | Caution, overreaching risk, missing data |
| `--info` / `--info-foreground` | Tips, coach insights, educational |
| `--destructive` | Errors, safety alerts, delete actions |

---

## 3. Typography

### Font Stack

- **Primary (sans):** Geist Sans — `var(--font-geist-sans)`
- **Monospace:** Geist Mono — `var(--font-geist-mono)` (for data, times, rep counts)

Both are loaded via `next/font/google` in `layout.tsx`.

### Type Scale

| Name | Tailwind Classes | Use |
|---|---|---|
| **Display** | `text-4xl font-bold tracking-tighter` | Hero headlines |
| **H1** | `text-3xl font-bold tracking-tight` | Page titles |
| **H2** | `text-2xl font-semibold tracking-tight` | Section headings |
| **H3** | `text-xl font-semibold` | Card titles |
| **H4** | `text-lg font-medium` | Sub-section labels |
| **Body L** | `text-base leading-relaxed` | Primary body text |
| **Body** | `text-sm leading-relaxed` | Standard UI text |
| **Caption** | `text-xs text-muted-foreground` | Metadata, timestamps |
| **Label** | `text-xs font-medium uppercase tracking-wider` | Form labels, tags |
| **Mono** | `font-mono text-sm tabular-nums` | Reps, weights, times |

### Typography Rules

- **Headings** always use `tracking-tight` or `tracking-tighter` — never default tracking.
- **Body copy** uses `leading-relaxed` (1.625). Headings use `leading-snug` (1.375).
- **Numbers** (reps, weight, duration): use `font-mono tabular-nums` so they don't reflow.
- **Max line length** (prose): `max-w-prose` (65ch). Never let body text span full-width on large screens.
- **Hierarchy**: use weight (`font-medium` → `font-semibold` → `font-bold`) before size.

---

## 4. Spacing System

FitFlow uses Tailwind's 4px grid exclusively.

### Key Spacing Values

| Token | px | Use |
|---|---|---|
| `space-1` | 4px | Micro-gaps, icon offsets |
| `space-2` | 8px | Tight chip padding, badge gaps |
| `space-3` | 12px | List item gaps |
| `space-4` | 16px | Card padding (mobile), standard gaps |
| `space-5` | 20px | — |
| `space-6` | 24px | Card padding (desktop), section inner gaps |
| `space-8` | 32px | Between major elements |
| `space-10` | 40px | Section padding |
| `space-12` | 48px | Large section gaps |
| `space-16` | 64px | Hero sections |

### Layout Containers

```tsx
// Full-bleed page shell
<div className="min-h-screen bg-background">

// Content container with responsive padding
<div className="mx-auto w-full max-w-md px-4 sm:px-6">   // Mobile app pages
<div className="mx-auto w-full max-w-2xl px-4 sm:px-6">  // Chat/coach views
<div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8"> // Marketing/dashboard

// Page content (accounts for fixed header + bottom nav)
<main className="pt-14 pb-24 sm:pb-6">
```

---

## 5. Border Radius Scale

| CSS Variable | Tailwind Class | Value | Use |
|---|---|---|---|
| `--radius-xs` | `rounded-xs` *(custom)* | 6px | Micro tags, tiny badges |
| `--radius-sm` | `rounded-sm` | 8px | Inline code, small chips |
| `--radius-md` | `rounded-md` | 10px | Input fields |
| `--radius-lg` | `rounded-lg` | 12px | Standard cards |
| `--radius-xl` | `rounded-xl` | 16px | Large cards, panels |
| `--radius-2xl` | `rounded-2xl` | 20px | Feature cards |
| `--radius-3xl` | `rounded-3xl` | 24px | Bottom sheets, hero cards |
| `--radius-pill` | `rounded-full` | 9999px | Primary buttons, avatars |

---

## 6. Elevation & Depth

FitFlow is **flat design**. No `box-shadow`. Depth is created by:

1. **Border** (`border border-border`) — subtle definition
2. **Background contrast** — card on background, tinted surface on card
3. **Scale transform** on hover/press — `hover:scale-[1.01]` or `active:scale-[0.98]`
4. **Backdrop blur** for overlays — `backdrop-blur-md bg-card/90`

```tsx
// ✅ Card definition — border, not shadow
<div className="rounded-xl bg-card border border-border p-4">

// ✅ Overlay — glass blur
<div className="rounded-3xl glass border border-border/50 p-6">

// ❌ Never
<div className="shadow-lg rounded-xl">
```

---

## 7. Component Library

### 7.1 Buttons

The primary button is always **pill-shaped** and **full-height**.

```tsx
// Primary — pill, full contrast
<Button className="rounded-full h-12 px-8 text-base font-semibold tracking-wide">
  Start Workout
</Button>

// Secondary / Ghost
<Button variant="ghost" className="rounded-full h-12 px-6 border border-border">
  Skip
</Button>

// Destructive
<Button variant="destructive" className="rounded-full h-12 px-6">
  Remove Plan
</Button>

// Icon + label
<Button className="rounded-full h-12 px-6 gap-2">
  <Play size={18} /> Start Session
</Button>

// Icon only
<Button variant="ghost" size="icon" className="rounded-xl h-11 w-11">
  <MoreHorizontal size={20} />
</Button>
```

**Size hierarchy on a screen:**
- One primary pill CTA
- At most two secondary actions (ghost/outline)
- Tertiary actions as text links: `text-primary text-sm font-medium underline-offset-2 hover:underline`

### 7.2 Cards

```tsx
// Standard workout/plan card
<div className="rounded-xl bg-card border border-border p-4 space-y-3">
  <div className="flex items-center justify-between">
    <h3 className="text-base font-semibold">Push Day</h3>
    <Badge>Today</Badge>
  </div>
  <p className="text-sm text-muted-foreground">6 exercises · 45 min</p>
  <Button className="w-full rounded-full h-11">Start</Button>
</div>

// Featured / hero card (today's workout)
<div className="rounded-3xl bg-primary p-6 text-primary-foreground space-y-4">
  <p className="text-sm font-medium opacity-80">Today's Session</p>
  <h2 className="text-2xl font-bold tracking-tight">Upper Body Power</h2>
  <div className="flex gap-3 text-sm opacity-80">
    <span>45 min</span>
    <span>·</span>
    <span>6 exercises</span>
  </div>
</div>

// Tinted info card
<div className="rounded-xl bg-brand-green-light border border-primary/20 p-4">
  <p className="text-sm font-medium text-primary">3 day streak!</p>
</div>

// Coral energy card
<div className="rounded-xl bg-brand-coral-light border border-accent/20 p-4">
```

### 7.3 Choice Chips (Generative UI)

```tsx
// Unselected
<button className="
  rounded-full h-10 px-4 text-sm font-medium
  bg-secondary text-secondary-foreground
  border border-border
  transition-all duration-150
  hover:border-primary/50 hover:bg-brand-green-light hover:text-primary
  active:scale-95
">
  3 days / week
</button>

// Selected
<button className="
  rounded-full h-10 px-4 text-sm font-medium
  bg-primary text-primary-foreground
  border border-primary
  active:scale-95
">
  ✓ 3 days / week
</button>
```

### 7.4 Number Stepper

```tsx
<div className="flex items-center gap-3 rounded-xl bg-secondary p-1 w-fit">
  <button className="h-9 w-9 rounded-lg bg-card border border-border flex items-center justify-center text-foreground font-bold hover:bg-muted active:scale-90 transition-all">
    −
  </button>
  <span className="min-w-[3rem] text-center text-lg font-semibold tabular-nums font-mono">
    45
  </span>
  <button className="h-9 w-9 rounded-lg bg-card border border-border flex items-center justify-center text-foreground font-bold hover:bg-muted active:scale-90 transition-all">
    +
  </button>
</div>
```

### 7.5 Bottom Navigation

```tsx
<nav className="fixed bottom-0 inset-x-0 pb-safe z-50 bg-card/95 backdrop-blur-md border-t border-border">
  <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
    {navItems.map(item => (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors",
          isActive
            ? "text-primary"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <item.icon size={22} />
        <span className="text-[10px] font-medium">{item.label}</span>
      </Link>
    ))}
  </div>
</nav>
```

### 7.6 Chat / Coach Feed

```tsx
// User message bubble
<div className="flex justify-end">
  <div className="max-w-[75%] rounded-3xl rounded-br-sm bg-primary text-primary-foreground px-4 py-3 text-sm leading-relaxed">
    Build me a 3-day workout plan
  </div>
</div>

// Assistant message
<div className="flex gap-3 items-start">
  <div className="w-8 h-8 rounded-full bg-brand-green-light border border-primary/20 flex items-center justify-center flex-shrink-0">
    <Bot size={16} className="text-primary" />
  </div>
  <div className="max-w-[80%] space-y-2">
    <div className="rounded-3xl rounded-tl-sm bg-card border border-border px-4 py-3 text-sm leading-relaxed">
      I can do that! How many days a week can you realistically train?
    </div>
    {/* Chips follow immediately below */}
  </div>
</div>
```

### 7.7 Workout / Exercise Cards

```tsx
// Exercise row in active workout
<div className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
  <div className="w-12 h-12 rounded-xl bg-brand-green-light flex items-center justify-center flex-shrink-0">
    <Dumbbell size={20} className="text-primary" />
  </div>
  <div className="flex-1 min-w-0">
    <p className="text-sm font-semibold truncate">Dumbbell Bench Press</p>
    <p className="text-xs text-muted-foreground">4 sets × 10 reps · 15 kg</p>
  </div>
  <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
</div>
```

### 7.8 Progress / Stats

```tsx
// Stat tile
<div className="rounded-xl bg-card border border-border p-4 space-y-1">
  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
    Volume
  </p>
  <p className="text-2xl font-bold tracking-tight font-mono tabular-nums">
    4,200 <span className="text-sm font-normal text-muted-foreground">kg</span>
  </p>
  <p className="text-xs text-primary font-medium">↑ 12% this week</p>
</div>
```

### 7.9 Safety Notice

```tsx
<div className="rounded-xl bg-destructive/10 border border-destructive/30 p-4 space-y-3">
  <div className="flex gap-2 items-start">
    <AlertTriangle size={18} className="text-destructive mt-0.5 flex-shrink-0" />
    <p className="text-sm font-medium text-destructive leading-snug">
      If you have severe, sudden, or worsening pain, seek urgent medical care.
    </p>
  </div>
  <Button variant="outline" className="w-full rounded-full h-10 text-sm border-destructive/40 text-destructive hover:bg-destructive/10">
    I understand, continue
  </Button>
</div>
```

### 7.10 Skeleton Loaders

Always mirror the real component shape:

```tsx
// Card skeleton
<div className="rounded-xl bg-card border border-border p-4 space-y-3 animate-pulse">
  <div className="h-4 w-3/4 rounded-lg bg-muted" />
  <div className="h-3 w-1/2 rounded-lg bg-muted" />
  <div className="h-10 w-full rounded-full bg-muted" />
</div>
```

### 7.11 Badges / Pills

```tsx
// Status badge
<span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-brand-green-light text-primary">
  Active
</span>

// Coral accent badge
<span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-brand-coral-light text-accent">
  Day 7 streak 🔥
</span>
```

---

## 8. Motion & Animation

### Principles

1. **Motion has meaning.** Animate direction, hierarchy, and feedback — not decoration.
2. **Keep it fast.** UI feedback: 100–150ms. Content transitions: 200–300ms. Never > 400ms.
3. **Ease out on enter, ease in on exit.**
4. **Respect `prefers-reduced-motion`.** Complex animations must be wrapped.

### Standard Transitions

```css
/* State change (color, border) */
transition-colors duration-150 ease-out

/* Position / size */
transition-all duration-200 ease-out

/* Opacity fade */
transition-opacity duration-200 ease-out

/* Lift on hover */
transition-transform duration-200 ease-out hover:-translate-y-0.5

/* Press feedback */
active:scale-[0.97] transition-transform duration-100 ease-in
```

### Page / Panel Transitions

```tsx
// Bottom sheet enter
"animate-in slide-in-from-bottom-4 fade-in duration-300 ease-out"

// Card appear
"animate-in fade-in zoom-in-95 duration-200 ease-out"

// Toast / snackbar
"animate-in slide-in-from-bottom-2 fade-in duration-200 ease-out"
```

### Choreography Rules

- Stagger list items: `delay-[${index * 50}ms]` (max 3 items, then cut)
- Never animate scroll position (dizzying on mobile)
- Progress bar fills: `transition-all duration-500 ease-out`

---

## 9. Mobile-First Layout Patterns

### The App Shell

```
┌─────────────────────────────┐  ← Fixed header (h-14)
│  ← FitFlow      [avatar]   │
├─────────────────────────────┤
│                             │
│   Page content              │  ← Scrollable main
│   pt-14 pb-24              │     (pt = header, pb = bottom nav)
│                             │
├─────────────────────────────┤
│  🏠 Coach  📋 Plan  📈 Prog  │  ← Fixed bottom nav (h-16 + safe area)
└─────────────────────────────┘
```

### Responsive Breakpoints

FitFlow is primarily a mobile web app. Desktop is secondary.

| Breakpoint | Width | Usage |
|---|---|---|
| (default) | < 640px | Mobile — primary design target |
| `sm:` | ≥ 640px | Large phones, small tablets |
| `md:` | ≥ 768px | Tablets — sidebar layout possible |
| `lg:` | ≥ 1024px | Desktop — optional wide layout |

### Layout Switching

```tsx
// Mobile: bottom nav; Desktop: sidebar
<div className="flex flex-col md:flex-row min-h-screen">
  <Sidebar className="hidden md:flex" />  {/* Desktop sidebar */}
  <main className="flex-1 pb-24 md:pb-0">
    {children}
  </main>
  <BottomNav className="md:hidden" />  {/* Mobile bottom nav */}
</div>
```

### Safe Area Handling

Required for notched/dynamic island devices:

```tsx
// Fixed elements at the bottom
<div className="fixed bottom-0 pb-[env(safe-area-inset-bottom)]">

// Using utility
<div className="fixed bottom-0 pb-safe">
```

---

## 10. Iconography

### Library: `lucide-react` only

Never mix icon sets. Lucide is already aligned with FitFlow's clean aesthetic.

### Size Scale

| Context | Size | Example |
|---|---|---|
| Inline in text | `size={14}` | Badge icon, inline indicator |
| Button label | `size={16}` | "→ Continue" |
| Nav bar | `size={22}` | Bottom navigation items |
| Card header | `size={20}` | Action buttons next to headings |
| Standalone | `size={24}` | Empty states, section icons |
| Hero / empty state | `size={40}` | Large empty state illustration |

### Icon Usage

```tsx
// ✅ Always pair with aria
<Button aria-label="Close">
  <X size={20} aria-hidden="true" />
</Button>

// ✅ Nav icon with label
<div className="flex flex-col items-center gap-1">
  <Home size={22} aria-hidden="true" />
  <span className="text-[10px] font-medium">Home</span>
</div>
```

---

## 11. Accessibility Standards

| Requirement | Standard |
|---|---|
| Color contrast (body) | ≥ 4.5:1 |
| Color contrast (large text / UI) | ≥ 3:1 |
| Touch target minimum | 44 × 44px |
| Focus indicator | `outline-2 outline-ring outline-offset-2` |
| Keyboard navigation | All interactive elements reachable via Tab |
| Screen reader | Semantic HTML + `aria-label` where needed |
| Reduced motion | All complex animations wrapped in media query |
| Form inputs | Always have associated `<label>` |

---

## 12. Content & Copy Guidelines

### Voice

- **Warm and direct.** "You're ready for day 3!" not "Workout scheduled."
- **Active.** "Start your session" not "Session can be started."
- **Brief.** Coach messages: 1–2 sentences max. Labels: ≤ 3 words.
- **Specific.** "45 min · 6 exercises" not "Multiple items."

### Error & Empty States

Every empty state needs:
1. A Lucide icon (size 40, `text-muted-foreground`)
2. A motivating heading (1 line)
3. A sub-line explaining what to do (1–2 lines)
4. An action button

```tsx
// Pattern
<div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-4">
  <Dumbbell size={40} className="text-muted-foreground" />
  <div className="space-y-1">
    <h3 className="text-base font-semibold">No plan yet</h3>
    <p className="text-sm text-muted-foreground">Tell your coach what you want to achieve and they'll build it.</p>
  </div>
  <Button className="rounded-full h-11 px-6">Create your plan</Button>
</div>
```

### Loading States

```tsx
// ✅ Skeleton that matches content shape
// ❌ Spinner with "Loading..." text

// Toast/feedback copy
"Plan saved" // not "Operation completed successfully"
"Workout started! Let's go." // celebratory
"Something went wrong — your progress is safe. Try again." // reassuring errors
```

---

## 13. Z-Index Scale

Avoid arbitrary `z-[999]`. Use this defined scale:

| Level | Value | Use |
|---|---|---|
| Base | `z-0` | Default content |
| Raised | `z-10` | Cards on hover, sticky headers |
| Overlay | `z-20` | Tooltips, popovers |
| Drawer | `z-30` | Bottom sheets, side drawers |
| Modal | `z-40` | Modals, dialogs |
| Navigation | `z-50` | Fixed header, bottom nav |
| Toast | `z-[100]` | Notifications above everything |

---

## 14. Dark Mode

FitFlow supports dark mode via the `.dark` class (Tailwind v4 convention set in `globals.css`).

### Rules

- Always test both modes when building a component.
- Never use `dark:` to compensate for a poorly chosen light mode color — fix the token.
- Background hierarchy in dark: `--background` (darkest) → `--card` → `--muted` (lightest).
- Green primary becomes brighter in dark mode to maintain contrast.
- Use `border border-border` everywhere — the border token auto-adjusts for dark mode.

### Common Dark Mode Patterns

```tsx
// Avoid mode-specific classes when a semantic token works
// ❌
<div className="bg-white dark:bg-zinc-900">
// ✅
<div className="bg-card">

// Image inversion for mono logos
<img className="dark:invert" src="/logo-dark.svg" />

// Glass surface
<div className="bg-white/90 dark:bg-card/90 backdrop-blur-md">
```

---

## 15. File & Component Conventions

```
src/
  app/
    globals.css           ← All CSS tokens live here
    layout.tsx            ← Font loading, shell
    (app)/
      coach/page.tsx      ← Chat/coaching screen
      plan/page.tsx       ← Weekly plan view
      progress/page.tsx   ← Progress & history
      profile/page.tsx    ← User profile & settings
  components/
    ui/                   ← shadcn primitives (don't modify)
    coach/                ← Generative chat UI components
    workout/              ← Workout & exercise components
    plan/                 ← Plan display components
    shared/               ← Cross-domain shared components
  lib/
    utils.ts              ← cn(), formatters
```

### Component file structure

```tsx
// ComponentName.tsx
import { cn } from "@/lib/utils"

interface ComponentNameProps {
  className?: string
  // explicit props — no any
}

export function ComponentName({ className, ...props }: ComponentNameProps) {
  return (
    <div className={cn("base-classes", className)} {...props}>
      {/* content */}
    </div>
  )
}
```

---

## Quick Reference Cheat Sheet

```
Primary action:     bg-primary text-primary-foreground rounded-full h-12
Secondary action:   border border-border text-foreground rounded-full h-12 hover:bg-muted
Card:               bg-card border border-border rounded-xl p-4
Featured card:      bg-primary text-primary-foreground rounded-3xl p-6
Chip (unselected):  bg-secondary text-secondary-foreground border border-border rounded-full h-10 px-4
Chip (selected):    bg-primary text-primary-foreground rounded-full h-10 px-4
Caption:            text-xs text-muted-foreground
Label:              text-xs font-medium uppercase tracking-wider text-muted-foreground
Success tint:       bg-brand-green-light text-primary
Energy tint:        bg-brand-coral-light text-accent
Info tint:          bg-brand-sky-light text-info
Touch target:       min-h-[44px] min-w-[44px]
Page padding:       px-4 sm:px-6
Section gap:        py-8 sm:py-12
```

---

*Last updated: October 2026. Maintained alongside `src/app/globals.css` and `.cursor/rules/`.*
