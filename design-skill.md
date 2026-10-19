---
name: calm-product-design
description: Use this skill when designing or theming any product UI, marketing site, landing page, dashboard or app screen for this owner. Triggers include choosing colours, fonts, spacing, buttons, cards, navigation, hero sections, illustrations or background images, starting a new project's look, or "make it look like our other projects". Covers the owner's fixed taste (rules that never change), the identity dials that MUST change per project so products don't look identical, tokens, type, colour rules, components, imagery and AI image generation, motion, and QA gotchas. Layout is NOT fixed by this skill; decide layout per project. Pair with frontend-skill.md for code conventions.
---

# Calm product design

A calm, airy, white-first look. One soft accent colour, Inter for everything, soft pastel tints for grouping, a dark "stage" to show the product, and quiet, high-resolution nature imagery. It should feel premium and modern, never loud.

This skill has two layers:

1. **Taste**: the rules below that hold in every project (calm, white-first, one accent, Inter, real imagery, minimal hero, soft shapes). Never change these.
2. **Identity**: the accent, neutral temperature, product stage, mono font, imagery and one signature detail. **These must be chosen fresh for each project** (see "Giving each project its own identity"). Two projects built from this skill should feel like siblings, not twins.

Layout, section order and content also change from project to project.

## The owner's taste (learned from real feedback)

Treat these as hard rules. Each one comes from something that was rejected or approved.

- **Calm over colourful.** A vivid saturated blue sky was rejected as "very very colourful". Backgrounds stay pale and low-saturation; colour is for small accents.
- **No cartoonish vector art.** A hand-drawn SVG landscape (flat hills, circle clouds and trees) was rejected as "cartoonish". Use real, high-quality imagery, or nothing.
- **Image quality matters.** An image upscaled on a large screen looked soft and blocky and was rejected. Source images must be at least as wide as the largest screen they fill.
- **Minimal hero.** Removed on request: the announcement bar, a badge above the headline, a secondary button, a platform line under the buttons, and a hotkey hint. The approved hero is a **headline, a one-line subtitle, one primary button, then the product visual**.
- **Short, plain copy.** A two-sentence subtitle was cut to one: "Select text in any app, press a hotkey, and PhaseType rewrites it in place."
- **Alignment is noticed.** A logo sitting 3px higher than the nav links was flagged. Check vertical centring of mixed items: logo, links and buttons.
- **Every project needs its own look.** A second project built straight from this skill (same lime, same greys, same sage-hills hero) was flagged because it looked "almost same" as the first, even with a different layout. Same taste, different identity.
- **Don't repeat an image on one page.** Reusing the hero landscape in the closing call-to-action card was flagged. Each image slot gets its own image.
- **Liked:** the floating pill nav with an accent active pill, pastel bento cards with coloured titles, the dark product stage, a sky-image card behind a feature block, a misty, pale, sharp landscape behind the hero, and (Scarfold) a navy blueprint stage, numbered section badges and a painted-sky closing card.
- **Reference sites:** timmo.co.in (white, Inter, lime, pastel bento, nature imagery: the first project's identity) and kerlig.com (for product positioning, not visuals). alvio.io's warm paper and serif look was the very first theme and was replaced.

## Giving each project its own identity

Before writing any UI for a new project, pick a value for **every dial** below and write the choices down (see the last section). Change at least four dials from every earlier project, and always use a new hero image. Pick values that fit the product's story: a builder tool got "blueprint", a writing tool might get "paper-white and ink".

| Dial | What changes | Stays fixed |
| --- | --- | --- |
| **Accent** | The hue of the `accent` / `accent-deep` / `accent-edge` trio. Pale fill, slightly deeper hover, clearly visible edge. | Used only for "this one" moments. Ink text on top. Never on large areas. |
| **Neutral temperature** | A slight tint in the greys: neutral, cool (slate), or warm (stone). Shift canvas, sunken, ink, muted, subtle and line together. | Still near-white canvas and near-black ink. Never cream or "paper". |
| **Product stage** | Stage colour (near-black, navy, deep green, aubergine…), grid style (faint square, blueprint major+minor, dots) and glow colours. | Dark, 28px radius, light UI windows on top. |
| **Mono font** | The font for code and numbers (system mono, JetBrains Mono, Geist Mono, IBM Plex Mono…). | Inter for everything else. No serif. |
| **Imagery** | Subject and style of every image slot: hero (e.g. sage hills, alpine lake, coastal dunes, snowfield, rice terraces) and image cards (painted sky, still water, field of grass…). Mix styles on one page, e.g. a photographic hero with a painterly closing card. | Calm, pale, low-saturation, sharp. Same composition rules. |
| **Signature detail** | One small recurring motif tied to the product: numbered section badges, a dimension-line divider, a key-cap motif, a footer wordmark treatment. | Subtle, and never more than one. |

### Theme recipes so far

Reuse a recipe only for a project that should openly look related. Otherwise make a new one.

**Lime (first project, timmo direction)**
- Accent `#bef264` / `#a3e635` / `#84cc16`.
- Neutral greys (canvas `#fafafa`, ink `#0a0a0a`).
- Stage `#171717` with a faint white 40px grid and a lime/sky glow.
- System mono.
- Hero: misty sage hills with a faint peach dawn.
- Signature: lime highlighter.

**Blueprint (Scarfold, a content API for small builders)**
- Accent `#bcd4ff` / `#9dbfff` / `#6b9bff`.
- Cool slate neutrals: canvas `#f7f9fc`, sunken `#f1f4f9`, ink `#0b1220`, ink-soft `#1e293b`, muted `#4b5567`, subtle `#9aa3b2`, line `#e3e8ef`, line-strong `#cfd6e0`.
- Navy stage `#0e1726` (line `#1d2a40`) with a blueprint grid: 24px minor lines at 4% and 120px major lines at 10%, in `rgb(147 187 255)`. Soft accent and violet glows.
- JetBrains Mono.
- Hero: photographic still alpine lake at blue hour with misty snow-dusted mountains.
- Closing card: hand-painted sky with sunlit clouds on the right, blossom branches bottom-left, tree canopy bottom-right.
- Signature: numbered section badges (`01 How it works`, the index in mono in the `accent-edge` colour) and a footer wordmark that fades from `accent/70`.

**Dune (FitFlow, an adaptive training coach)**
- Accent `#fde8b0` / `#f8d987` / `#c98a1a` (honey). Named `accent-soft` / `accent-deep` / `accent-edge` here because the app's existing shadcn theme already owns `--color-accent`.
- Warm stone neutrals: canvas `#faf9f7`, sunken `#f3f1ed`, ink `#111110`, ink-soft `#2a2724`, ink-muted `#56504a`, ink-subtle `#a49d94`, line `#e8e4de`, line-strong `#d8d2c9`.
- Deep forest stage `#10221b` (line `#1e3b30`) with a 26px dot grid in `rgb(201 232 214)` at 16%, plus a honey and a mint glow.
- IBM Plex Mono.
- Hero: photographic sunrise over coastal grassland — pale cream and apricot sky, wind-combed grasses and dunes in the bottom band, small pines at both edges. Fit `min-h-[480px] md:min-h-[calc(503px_+_14.7vw)]` on the hero section itself, with the image as `absolute inset-0` (not `-z-10`, which drops it behind the page background).
- Closing card: hand-painted warm morning sky, sculpted clouds on the right, meadow grasses bottom-left and an olive canopy bottom-right.
- Signature: the week rail — seven day dots (trained, live, open) inside every section badge and in the footer.
- The app's green-and-coral tile mark is deliberately not used on this surface; a typographic lockup with one honey dot stands in.

## Tokens

Use semantic names, never raw hex in components. Always call the accent **`accent`** (never by its hue, e.g. `lime`), so a project can re-theme by editing three lines. This is the Tailwind v4 `@theme` block, filled with the default (Lime) values; for other stacks use the same values as CSS custom properties.

```css
@theme inline {
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, -apple-system, sans-serif;
  --font-mono: ui-monospace, 'SF Mono', SFMono-Regular, Menlo, monospace; /* or var(--font-<project-mono>) first */
}

@theme {
  /* Neutrals (shift temperature per project) */
  --color-canvas: #fafafa;      /* page background */
  --color-surface: #ffffff;     /* cards, nav, inputs */
  --color-sunken: #f4f4f5;      /* wells, illustration panels, hover fills */
  --color-ink: #0a0a0a;         /* headings, primary buttons */
  --color-ink-soft: #262626;    /* strong body text */
  --color-muted: #525252;       /* body copy, descriptions */
  --color-subtle: #a3a3a3;      /* placeholders, meta, numbering */
  --color-line: #e5e5e5;        /* borders */
  --color-line-strong: #d4d4d4; /* key caps, dashed borders */

  /* The one accent (pick per project) */
  --color-accent: #bef264;      /* accent fill */
  --color-accent-deep: #a3e635; /* accent hover */
  --color-accent-edge: #84cc16; /* accent border and focus ring */

  /* Status (sparingly) */
  --color-ember: #ea7a1f;
  --color-danger: #dc2626;
  --color-success: #16a34a;

  /* Dark product stage (pick per project) */
  --color-stage: #171717;
  --color-stage-line: #2a2a2a;

  /* Pastel tints: card fill, card border, title colour */
  --color-violet-tint: #f6f1ff;  --color-violet-edge: #e6dbff;  --color-violet-ink: #7c3aed;
  --color-sky-tint: #eef6fd;     --color-sky-edge: #d4e8f8;     --color-sky-ink: #0284c7;
  --color-peach-tint: #fdf4e9;   --color-peach-edge: #f6e0c6;   --color-peach-ink: #c2410c;
  --color-mint-tint: #effbf1;    --color-mint-edge: #cdeed4;    --color-mint-ink: #15803d;

  /* Shadows: soft and low (tint the rgb with the ink colour) */
  --shadow-card: 0 1px 2px rgb(10 10 10 / 0.04), 0 12px 32px -20px rgb(10 10 10 / 0.18);
  --shadow-float: 0 8px 30px -12px rgb(10 10 10 / 0.18);
  --shadow-window: 0 1px 0 rgb(10 10 10 / 0.04), 0 30px 70px -30px rgb(0 0 0 / 0.6);
  --shadow-key: 0 2px 0 var(--color-line-strong);
}

/* Accent highlighter stroke across the lower half of key words. */
@utility marker {
  background-image: linear-gradient(to bottom, transparent 52%, var(--color-accent) 52%, var(--color-accent) 90%, transparent 90%);
  padding-inline: 0.06em;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}
```

Base: `body` is `bg-canvas text-ink font-sans antialiased` with Inter features `'cv11', 'ss01'`. Text selection is accent on ink.

Keep the pastel trios in every project; they are part of the taste. If the accent sits close to one pastel (e.g. a blue accent and the sky tint), lean on the other tones in the bento mix.

## Typography

Inter only, loaded through the framework's font loader (`next/font/google` in Next.js). No serif. The monospace font (chosen per project) is used only for numbers, code and small index labels.

| Role | Size (mobile → desktop) | Weight | Tracking | Line height |
| --- | --- | --- | --- | --- |
| Hero h1 | 44px → 60px → 76px | 400 | -0.035em | 0.98 |
| Section h2 | 36px → 48px | 500 | -0.025em | 1.1 |
| Card title | 24px | 500 | -0.03 to -0.04em | tight |
| Body large (subtitles) | 18px → 20px | 400 | normal | relaxed |
| Body | 15px | 400 | normal | relaxed |
| Labels, nav, buttons | 13–16px | 600 | normal | normal |
| Big numbers | 36px → 48px mono | 400 | normal | normal |

- Big headings are **light (400) with tight tracking**; that contrast with the bold UI labels is the signature.
- Use `text-balance` on headings and `text-pretty` on paragraphs.
- Highlight one or two key words in a headline with `.marker`. Never a solid accent box: it overlaps neighbouring lines.
- Colour emphasis inside a title: the first words take a pastel `*-ink` colour and the rest stays ink (for example a sky-blue "Ask" then "for anything" in ink).
- Give the hero subtitle enough width (`max-w-2xl`) that it stays on one line on desktop.

## Colour rules

- **White-first.** Most of the screen is canvas or surface. Colour appears in small doses.
- **The accent means "this one".** Use it for the active nav item, the highlighter, the secondary call to action, a "New" chip, or a selected state. Never for large areas or body text, and never on more than one or two elements per view.
- **Primary actions are black** (`bg-ink text-white`). The accent button is the secondary action, with an `accent-edge` border.
- **Pastels group content.** Each tinted card uses its tint, edge and ink trio together. Mix tones across a grid and leave some cards plain white so it doesn't turn into a rainbow.
- **Dark stage for the product.** Show screenshots or demos on `bg-stage` with the project's grid and a very soft glow. Light UI windows on a dark stage pop against the white page.
- Body text is `muted` on light backgrounds and `white/65` on dark ones. Keep contrast at AA or better.

## Shape and spacing

- **Radii:** buttons, nav, badges and chips are `rounded-full`. Inputs and small tiles use 12–16px. Cards use 28px. Feature panels and image cards use 32px. The product stage uses 28px.
- **Borders:** 1px `line` on every card; tinted cards use their `-edge` colour. Shadows stay soft (`shadow-card`). Avoid heavy drop shadows.
- **Container:** `max-w-6xl` with 16/24/32px side gutters. The nav is narrower (`max-w-3xl`).
- **Rhythm:** sections are `py-24 sm:py-32`. Heading to content is 48–56px. Grid gaps are 16–20px.
- **Phones:** design at 390px wide with no horizontal scroll. Side-by-side grids collapse to one column. Hide secondary nav links below 1024px rather than letting them wrap.

## Components

**Floating pill nav.** A sticky bar 12–16px from the top: `rounded-full`, `bg-surface/75 backdrop-blur-xl`, 1px border, `shadow-card` that becomes `shadow-float` on scroll. Logo on the left, links in the middle (13–14px, weight 600), and a black primary button on the right. The current section sits on an accent pill, tracked with an IntersectionObserver. Put the logo inside a `flex items-center` link and give the wordmark `leading-none` so it centres with the links.

**Buttons.** Pills, weight 600, heights 36/44/48px.
- Primary: `bg-ink text-white hover:bg-ink-soft`.
- Accent: `bg-accent border border-accent-edge/70 text-ink hover:bg-accent-deep`.
- Secondary: `bg-surface border border-line shadow-card`.
- Focus ring: 2px `accent-edge` with an offset.
- An icon before or after the label nudges 2px on hover.

**Pill badge** above section titles: `rounded-full border bg-surface px-3 py-1 text-[13px] font-medium shadow-card`. Centred with the heading by default; left-aligned headings align it to the start (don't let it stretch). Optional signature variant: a mono index chip inside the pill (`01`, `02`…).

**Section heading:** badge, h2 and one or two lines of description in `muted`, centred and capped at `max-w-2xl`.

**Cards**
- Plain: `rounded-[28px] border border-line bg-surface p-6 sm:p-7 shadow-card`.
- Illustrated (stat or step card): an outer white card with `p-2`, holding a `bg-sunken rounded-[20px]` panel for a small visual, with a mono number, title and description below.
- Bento: a 4-column grid on desktop, some tiles spanning 2 columns. Wide tiles may hold a live-looking mini UI (a feed of rows, a list of shortcuts with "Available" marks). Fill every row at every breakpoint (check the 2-column tablet layout too); no empty cells.

**Key caps:** white, 1px `line-strong` border, `shadow-key`. Sizes 20/32/56px.

**Mini UI rows inside cards** (feeds, lists): white rows, `rounded-2xl`, `shadow-card`, a coloured icon square on the left, bold title with a muted timestamp, and a muted subline.

**Segmented tabs:** a white pill container with `p-1.5`; the active tab is a black pill and the others are muted with a sunken hover.

**FAQ:** a single white card split by dividers. Native `<details>` so it works without JavaScript; the plus icon sits in a sunken circle and turns accent-coloured and rotates when open.

**Facts row:** large monospace numbers with small muted labels, separated by vertical dividers, with a border above and below. Only use real, verifiable facts, never invented user counts.

**Footer:** light (`canvas`) with the logo, a short description, link columns, a giant faint wordmark and a copyright line. Fade the wordmark from `line-strong` (or `accent/70` as a signature) to transparent with `bg-clip-text`. **Don't outline it with `-webkit-text-stroke`**: Inter's glyphs have overlapping contours (the box inside the "f", the "rf" join) that show through and look broken.

## Imagery

Imagery should be calm, natural and sharp. Prefer AI-generated landscape or sky images over illustration. **Every project gets new images, and every image slot on a page gets its own image.**

### Hero landscape
- Near-white sky in the top ~70% with the centre left empty for the headline. The horizon sits at about 70% down, with land only in the bottom ~30%. Small trees only at the far left and right edges.
- The palette is low-saturation and hazy, tuned to the project's neutrals (warm projects: cream-peach haze; cool projects: powder-blue and silver). Approved so far: "misty morning, layered sage hills, faint peach glow" (Lime) and "still alpine lake at blue hour, misty snow-dusted range, glassy water" (Blueprint).
- Position it behind the nav and hero (`absolute`, `object-cover object-bottom`) and fade only the bottom quarter into `canvas`. Pale skies need no extra wash.
- **Keep the land level with the main button on every screen.** Make the image box grow with the viewport width: `h-[Apx] md:h-[calc(Bpx_+_Cvw)]`. **Re-fit A, B and C for every new image**, because taller subjects (mountains) sit higher than low hills. Method: screenshot at 390, 768, 1512 and 1920px; note how far the top of the land sits from the button at each width; add that offset to the box height and fit a straight line (offset ≈ B + C·width). Lime hills used `h-[500px] md:h-[calc(380px_+_19vw)]`; the Blueprint mountains needed `h-[600px] md:h-[calc(397px_+_26vw)]`. Re-measure whenever the hero's content changes height.

### Image cards
For a highlighted block such as the closing call to action, privacy or a sponsor, use a **different** image from the hero. Default: a painted sky with soft clouds on one side, the text side left open, and small foliage in the bottom corners (blossom branches at one corner, a tree canopy at the other). Anchor it `object-bottom` so both corners stay in frame. Add a left-to-right white wash (`from-white/55 via-white/15 to-transparent`) so text on the left stays readable. A painterly card under a photographic hero (or the reverse) gives the page range without breaking the calm.

### Generating images (OpenAI)
- **Model:** `gpt-image-2` (check `GET /v1/models` for newer stable ones; skip preview codenames). Use `quality: 'high'`.
- **Size:** the largest the budget allows. 3456×2304 (3:2) works; 3840×2560 is over the pixel budget. Sizes must be multiples of 16 and the longest edge at most 3840. A bad size is rejected before any charge, so use that to probe limits.
- **Cost:** every image is billed to the owner's OpenAI account. Start with **one** call per image slot; a well-specified prompt usually lands first time. Only generate 2–3 variants if the first misses, and say how many calls were made, including interrupted ones (a request that was killed mid-flight may still be billed).
- **Key handling:** read `OPENAI_API_KEY` from a git-ignored `.env`, never print it, and make sure `.env` is in `.gitignore` before using it. Requests take about a minute; run them in the background.
- **Hero prompt template** (the parts that mattered):
  > Wide 3:2 website hero background behind dark headline text, for a clean minimal white website. Calm, LOW SATURATION, soft, muted, airy, high-key, gentle haze, nothing vivid. The top 70% is open sky, very pale near the top, centre empty and smooth with no detailed clouds. The horizon is at about 70% from the top; landscape fills only the bottom 30%. Trees small and only at the far left and right edges. Smooth gradients, sharp, no noise. No people, animals, buildings, roads, text, logos or watermark. *[style line]*
- **Style lines that worked:**
  - Lime: "layered misty sage hills, faint warm peach glow near the horizon, muted pastel, photographic".
  - Blueprint: "Still alpine lake at blue hour: very pale powder-blue and silver sky, a distant low range of mountains with faint snow along the horizon dissolving into soft mist, glassy calm water with faint reflections in the bottom band, a few small dark pines only at the far left and right edges, cool muted blue-grey palette, photographic".
- **Image-card prompt that worked:**
  > Wide 3:2 background image for a call-to-action card on a clean minimal white website, with dark text placed over the LEFT half. Hand-painted anime feature-film background, soft brushwork, restrained pastel palette, LOW SATURATION, calm, airy, high-key, nothing vivid. A pale evening sky in powder blue and soft periwinkle with a few large soft sculpted cumulus clouds on the RIGHT side, catching a faint warm cream light. The left half of the image is open, smooth, very pale sky with no detail. Small foliage only in the bottom corners: a few delicate pale blossom branches entering from the bottom-left corner, and the soft rounded canopy of a tree in the bottom-right corner. No ground, no horizon line, no buildings, people, animals, text, logos or watermark. Smooth gradients, sharp, no noise.
- To get the painterly anime look, describe it ("hand-painted anime feature-film background, soft brushwork, sculpted clouds") rather than naming a studio, and always pair it with "restrained pastel, low saturation".
- **Post-process:** convert to WebP at quality 84–88 (smooth skies band below that), keep the full resolution (they come out around 100–160 KB), and import it statically so `next/image` adds a blur placeholder and responsive sizes. Delete images that are no longer used, so they don't ship.

## Motion

Subtle and purposeful. Never bouncy.

- Page load: the hero content rises 18px and fades in over 700ms (`cubic-bezier(0.2, 0.7, 0.2, 1)`), with a 150ms stagger for the visual.
- Scroll: sections fade up through a CSS scroll-driven animation (`animation-timeline: view()`), only inside `@supports` and `prefers-reduced-motion: no-preference`, so content is never hidden without it.
- Small UI: pop-in at 220ms, a 1s blinking caret, a shimmer placeholder, and pulsing wave dots for "working".
- Hover: colour changes and 2px nudges only.
- **Reduced motion:** turn off all animation and show a still, finished frame of any demo.

## QA and known gotchas

- Check every page at 390, 768, 1024, 1512 and 1920px wide with screenshots before calling it done. Also measure `document.documentElement.scrollWidth - innerWidth` (must be 0) and the vertical centres of the logo and nav links (must match).
- **Full-page screenshots look blank** below the hero because the scroll-driven fade-up never triggers. Scroll each section into view and screenshot the viewport instead.
- **Mock windows overflowing on phones:** long code or URLs inside a CSS grid push the column wider than the screen. Use `grid-cols-1` / `minmax(0,1fr)` columns (not bare `grid` or `1fr`) and `truncate` long URLs.
- **Code samples:** keep lines under about 60 characters so they fit a half-width window on desktop. Shorten the example endpoint and pull keys into a `const KEY` line, and make sure every variable a sample uses is defined.
- **Next.js 16 with Cache Components:** `new Date()` in a server component (e.g. the footer year) fails the prerender. Move it into a `"use cache"` helper.

## Do and don't

**Do**
- Fill in every identity dial before building, and keep each view to one primary action and one accent highlight.
- Show the real product (a realistic mock or screenshot) on the dark stage near the top.
- Keep headlines short and subtitles to one line.

**Don't**
- Ship a new project with the same accent, stage and hero image as an earlier one.
- Reuse one image in two slots on the same page.
- Use serif fonts, cream or "paper" backgrounds, or the old lime-to-ember gradient marker (that was the first theme).
- Use saturated full-bleed colour, rainbow grids, or heavy shadows.
- Draw scenery with SVG or CSS shapes.
- Stack extra lines (badges, platform notes, hint rows) around the hero call to action.
- Invent numbers, ratings or testimonials.

## Adapting to a new project

1. **Pick the identity.** Choose a theme idea from the product's story, then set every dial: accent trio, neutral temperature, stage colour and grid, mono font, imagery for each slot, and one signature detail. Compare against "Theme recipes so far" and change at least four dials.
2. **Copy the token block** and swap in the chosen values. Keep the token names (`accent`, `stage`, …) and the pastel trios.
3. **Choose the layout fresh** for the product. Reuse the component styles above, not the section list.
4. **Generate new images**: one call per slot, from the templates above with a new style line. Fit the hero with the width-based height trick, re-fitting the numbers for the new image.
5. **Run the QA checks** at all five widths.
6. **Record the new recipe** under "Theme recipes so far" in this file (accent, neutrals, stage, mono, imagery, signature), so the next project can stay distinct from it.
