# Workout Home — Plan & Implementation Spec

> **Status:** Phases 1–2 implemented (backend + the `/home` page) · Phase 3 pending
> **Scope:** a new authenticated `/home` surface where a user manages their active plan and logs today's session without talking to the coach — plus the backend changes that make per-day session state a first-class thing.
> **Companion docs:** [`design-system.md`](./design-system.md) (all UI work), [`generative-chat-ui.md`](./generative-chat-ui.md) (chat contract — unchanged by this work).

---

## 1. Why this exists

Today, everything a user can do with their plan happens inside the chat workspace (`/chat`). That works, but it forces a conversation for things that are really just taps: *mark this done*, *skip that*, *what am I doing today*, *show me the week*.

Two problems to solve:

1. **No manual surface.** There's no page where a user can just open the app and work through today's session.
2. **No per-day session state.** The only durable record of "what happened on a date" is `conversation.dailyLogs[]` — an embedded array of `{ date, dayLabel, entries[{ exerciseId, status, note }] }`. It records *status of plan exercises*, but it does not record *what the session actually was*.

Problem 2 is the blocker. Consider the real case the product already promises:

> "I only have 30 minutes today and my shoulder hurts — give me something else."

Right now the only writable target is `activePlan`, so the coach either edits the user's permanent weekly plan (wrong — next Monday's chest day is now permanently different) or changes nothing durable (also wrong — reload and the adjustment is gone). What's missing is a **per-date session document** that starts as a copy of the plan day and can then diverge from it freely.

### The core model change

```
activePlan            = the template. Changes rarely. Edited only by an explicit plan update.
workout_sessions      = one document per (user, date). The actual session.
                        Materialized from the plan day, then freely mutable.
```

Every "just for today" change — shorter session, swapped exercise, removed movement, added finisher — writes to the session document. The plan is never touched. This also gives us real history: streaks, weekly volume, completion rate, and "what did I actually do three Tuesdays ago" all become queries over one collection instead of a derived guess.

---

## 2. Non-goals (explicitly out of scope)

- **No change to the chat UX.** `/chat`, the coach agent's instructions, the widget set, and the right-hand live panel all keep working exactly as they do now. Phase 1 and 2 are strictly additive; the existing `PATCH /api/coach/today-log` contract is preserved via an adapter (§4.4).
- No set-by-set weight/rep logging yet (schema leaves room — §3.3).
- No rest timer, no video playback, no social/sharing, no notifications.
- No multi-week periodization or plan history/versioning beyond what exists.
- No progress/analytics page. (Session history makes it cheap later; not now.)

---

## 3. Backend

### 3.1 New collection: `workout_sessions`

New file: `src/models/workout-session.ts`, exported from `src/models/index.ts`, registered with the existing `registerModel` helper.

```ts
// Sub-document: one exercise inside one session.
const sessionExerciseSchema = new Schema(
  {
    exerciseId: { type: String, required: true },
    name:       { type: String, required: true },
    sets:       { type: Number, required: true },
    reps:       { type: String, required: true },
    equipment:  { type: String, required: true },
    instructions: { type: [String], default: [] },
    muscles:      { type: [String], default: [] },
    images:       { type: [String], default: [] },

    /** Display order within the session. Dense, 0-based, re-packed on mutation. */
    order: { type: Number, required: true },

    /** Where this row came from, so the UI can show "swapped for today". */
    origin: {
      type: String,
      enum: ["plan", "added", "swapped"],
      default: "plan",
    },
    /** When origin === "swapped": the plan exercise this one stands in for. */
    replacesExerciseId: { type: String, default: null },

    status: {
      type: String,
      enum: ["pending", "done", "skipped"],
      default: "pending",
    },
    note:        { type: String, default: null },
    completedAt: { type: Date, default: null },
  },
  { _id: false },
);

const workoutSessionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },

    /** Local calendar date, "YYYY-MM-DD". See §3.5 on timezones. */
    date:     { type: String, required: true },
    /** "Monday" … "Sunday" — the weekday `date` falls on. */
    dayLabel: { type: String, required: true },

    /** Provenance: which plan (and version) this session was materialized from. */
    planId:      { type: String, default: null },
    planVersion: { type: Number, default: null },
    /** Plan day id, so we can tell which template day this came from. */
    planDayId:   { type: String, default: null },

    focus:         { type: String, default: "" },
    targetMinutes: { type: Number, default: null },

    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "skipped", "rest"],
      default: "not_started",
      index: true,
    },

    /**
     * Set when the session diverges from the plan day ("30 min today",
     * "shoulder pain"). Purely descriptive — the divergence itself lives in
     * `exercises` / `targetMinutes`.
     */
    adjustment: {
      type: new Schema(
        {
          reason:       { type: String, required: true },
          source:       { type: String, enum: ["coach", "user"], default: "user" },
          fromMinutes:  { type: Number, default: null },
          toMinutes:    { type: Number, default: null },
          adjustedAt:   { type: Date, default: Date.now },
        },
        { _id: false },
      ),
      default: null,
    },

    exercises: { type: [sessionExerciseSchema], default: [] },

    startedAt:   { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// One session per user per calendar date.
workoutSessionSchema.index({ userId: 1, date: 1 }, { unique: true });
// History reads: "last 30 days", "this week".
workoutSessionSchema.index({ userId: 1, date: -1 });
```

**Why denormalize the exercise fields (name/sets/reps/images) into the session?**
Because the session must stay a truthful record of what was done even after the plan changes or an exercise is swapped. The plan is a template; the session is history. The same reason `conversation.activePlan` already denormalizes catalog data.

### 3.2 Session status semantics

| `status` | Meaning | How it's set |
|---|---|---|
| `not_started` | Materialized, nothing logged yet | On creation |
| `in_progress` | At least one exercise marked done/skipped | Automatically, on first exercise log |
| `completed` | Every exercise is done-or-skipped, or user tapped *Finish* | Automatically when no `pending` remain, or explicitly |
| `skipped` | User explicitly skipped the whole day | Explicit action |
| `rest` | The plan day has no exercises | On creation |

`status` is derived from `exercises` on every write rather than being free-floating — one function, `deriveSessionStatus(session)`, owns the rule so the UI and the coach can't disagree.

### 3.3 Reserved for later (do not build now)

`sessionExerciseSchema` intentionally leaves room for per-set logging:

```ts
// Phase 4 — not in scope:
// setLogs: [{ setNumber, reps, weight, unit, completed }]
```

Adding it later is a pure append; nothing in Phase 1–3 needs to change.

### 3.4 Materialization: `ensureSession`

The heart of the backend. New file: `src/features/workout/lib/session-store.ts` (`import "server-only"`).

```ts
ensureSession(userId: string, date: string, dayLabel: string): Promise<WorkoutSessionDTO>
```

1. `findOne({ userId, date })` → if it exists, return it. **Never re-materialize a session that has been touched** — it may have diverged on purpose. The one exception: a session still at `not_started` whose `planId` no longer matches the active plan is stale (the user adopted a new plan today, before logging anything), so it is rebuilt from the new plan day. This is what keeps "new plan accepted in chat" from leaving a dead session behind, without the plan-writing routes needing to know the client's calendar date.
2. Otherwise load `conversation.activePlan`. No active plan → return `null` (caller redirects to `/chat`).
3. Find the plan day whose `label === dayLabel`. Not found or `exercises.length === 0` → create a `rest` session with `exercises: []`.
4. Otherwise create the session, copying each plan exercise into a `sessionExercise` with `origin: "plan"`, `status: "pending"`, dense `order`.
5. Write with an upsert guarded by the unique `{ userId, date }` index, and treat a duplicate-key error as "someone else just created it" → re-read and return. (Two tabs opening at once is a real case.)

Everything else in the store module:

| Function | Purpose |
|---|---|
| `getSession(userId, date)` | Read without creating |
| `getSessionRange(userId, from, to)` | Week strip + streaks |
| `setExerciseStatus(userId, date, exerciseId, status, note?)` | Single-exercise log; re-derives session status |
| `setSessionStatus(userId, date, status)` | Explicit start / finish / skip-day / reset |
| `applySessionAdjustment(userId, date, patch)` | Day-only edit: replace/add/remove exercises, change `targetMinutes`, record `adjustment` |
| `resetSessionToPlan(userId, date)` | Throw away today's divergence, re-materialize from the plan |

**Every function takes `userId` and scopes its query by it.** No endpoint accepts a session `_id` from the client.

### 3.5 Fix: the date is computed two different ways

Current code does `new Date().toISOString().slice(0, 10)` (a **UTC** date) for `date`, but `toLocaleDateString("en-US", { weekday: "long" })` (a **local** weekday) for `dayLabel`. For anyone east of UTC after ~05:30 local, or west of UTC before midnight, those two can describe different days — so a log can land on a `(date, dayLabel)` pair that never reoccurs, and the Today card silently shows an empty log.

This is pre-existing and worth fixing as part of this work, because the new collection makes `date` a primary key rather than a lookup hint.

Add `src/lib/date/today.ts`:

```ts
/** Local calendar date as YYYY-MM-DD (not UTC — see docs/workout-home-page.md §3.5). */
export function toDateKey(date: Date): string   // en-CA formatting → "2026-10-19"
export function toDayLabel(date: Date): string  // "Monday"
export function getTodayRef(): { date: string; dayLabel: string }
```

Replace the four duplicated copies of this logic: `app/(app)/chat/page.tsx`, `features/chat/use-chat-conversation.ts`, `features/chat/components/panel/today-card.tsx`, `features/chat/components/panel/plan-tab.tsx`. The client remains the source of truth for "what day is it for this user" and keeps passing `(date, dayLabel)` to the server — we are not introducing a stored timezone yet.

### 3.6 Removing `conversation.dailyLogs`

`workout_sessions` supersedes it. Nothing has launched, so there is no data to preserve and no migration to write — the field and its sub-schemas (`exerciseLogEntrySchema`, `dayLogSchema`) come out of `models/conversation.ts` in the same commit that adds the new collection. Any rows sitting in a dev database are disposable; drop them.

What *does* need preserving is the chat code, which reads and writes `DayLog` today and must not change. So the API shape stays and only its backing store moves:

- `PATCH /api/coach/today-log` keeps its exact request and response shape, but internally calls `setExerciseStatus(...)` and maps the resulting session back to a `DayLog` (`{ date, dayLabel, entries[] }`).
- `getConversationData()` and `GET /api/coach/conversation` keep returning `todayLog`, now derived from the session via the same mapper.
- `DELETE /api/coach/conversation` currently clears `dailyLogs` as part of "start a new chat". It should instead delete that user's `workout_sessions` — the reset dialog promises "all logged sets, reps, and progress", so the promise has to keep being true.

One mapper, `sessionToDayLog(session): DayLog`, in `src/features/workout/lib/adapters.ts`. The chat feature keeps importing `DayLog` from `features/chat/types` and never learns that sessions exist.

### 3.7 Types

New file `src/features/workout/types.ts`, re-exporting shared pieces from `features/chat/types` rather than redefining them (`Exercise`, `ExerciseLogStatus`, `Plan`, `PlanDay`). New types:

```ts
export type SessionStatus = "not_started" | "in_progress" | "completed" | "skipped" | "rest";
export type SessionExerciseOrigin = "plan" | "added" | "swapped";
export type SessionExercise = Exercise & {
  order: number;
  origin: SessionExerciseOrigin;
  replacesExerciseId?: string;
  status: ExerciseLogStatus;
  note?: string;
  completedAt?: string;
};
export type WorkoutSession = { /* …as §3.1, dates as ISO strings */ };
export type WeekDaySummary = {
  date: string; dayLabel: string; status: SessionStatus;
  focus: string; doneCount: number; totalCount: number; isToday: boolean;
};
```

Mongoose documents must be `.lean()`-ed and mapped to these DTOs before crossing into client components — hydrated subdocuments break RSC prop serialization (the existing `get-conversation-data.ts` already notes this).

---

## 4. API surface

Route handlers, not server actions — matching the existing `/api/coach/*` pattern and the client's `fetch`-based mutation style. All handlers: `getSessionFromCookies()` first, `apiError(..., 401, "UNAUTHORIZED")` on failure, `connectDB()`, then scope every query by `userId`.

New routes under `src/app/api/workout/`:

| Method & path | Body / query | Returns |
|---|---|---|
| `GET /api/workout/today` | `?date=&dayLabel=` | `{ session, week, plan }` — materializes if needed; `404 NO_ACTIVE_PLAN` when there's no plan |
| `PATCH /api/workout/today/exercise` | `{ date, exerciseId, status, note? }` | `{ session }` |
| `PATCH /api/workout/today/status` | `{ date, status }` (`in_progress` / `completed` / `skipped` / `not_started`) | `{ session }` |
| `PATCH /api/workout/today/adjust` | `{ date, targetMinutes?, reason, remove?: string[], add?: SessionExerciseInput[], replace?: { exerciseId, withExerciseId }[] }` | `{ session }` |
| `POST /api/workout/today/reset` | `{ date }` | `{ session }` — re-materialize from plan |
| `GET /api/workout/week` | `?date=` | `{ week: WeekDaySummary[] }` |

**Date validation.** `date` is accepted from the client (the client owns "today"), but every handler validates `/^\d{4}-\d{2}-\d{2}$/` and rejects dates more than one day either side of the server's own date — enough to stop a client writing arbitrary history without needing a stored timezone.

`PATCH /api/coach/today-log` stays exactly as it is from the outside, re-implemented over the store per §3.6.

---

## 5. Frontend

### 5.1 Route and redirect

```
src/app/(app)/home/page.tsx          — RSC: session check → plan check → data load
src/app/(app)/home/home-page-client.tsx
```

**No `loading.tsx` here, deliberately.** A `loading.tsx` opens a streaming
boundary, and once the response has started streaming Next can no longer answer
with a 307 — the no-plan redirect degrades into
`<meta http-equiv="refresh" content="1;url=/chat">`, so a user without a plan
watches a workout skeleton for a second before being bounced. Without the file
the page answers in ~200ms with a clean 307 for the redirect case, which is the
better trade for three indexed queries.

The page is a server component:

1. `getSessionFromCookies()` → falsy → `redirect("/sign-in?callbackUrl=/home")`.
2. `ensureSession(...)` returns `null` (no active plan) → `redirect("/chat")`. **This is the requested behavior: no plan means the coach is the only sensible destination.**
3. Otherwise render `<HomePageClient>` with `{ session, week, plan, userName }`.

Routing changes needed elsewhere:

- `src/lib/auth/constants.ts` → `PROTECTED_ROUTE_PREFIXES = ["/chat", "/home"]`.
- `src/proxy.ts` → `matcher: ["/chat/:path*", "/home/:path*", "/sign-in", "/sign-up"]`, and the authenticated-user redirect target becomes `/home` (which itself bounces to `/chat` when there's no plan, so a brand-new user still lands in the conversation). Note the proxy only does the optimistic cookie check; the plan check must stay in the page, since the proxy can't read Mongo.
- Post-sign-in `callbackUrl` default and the landing page's "Open app" CTA → `/home`.

### 5.2 Navigation between the two surfaces

Both surfaces need a one-tap route to the other:

- `/home` header: a link to `/chat` labelled *Ask coach*.
- `/chat` header: a link to `/home`, shown only when `hasPlan` — the single visible change to the chat surface, and additive. The existing `ChatHeader` already renders a `Link` and has a slot pattern for this.

Deep-linking the composer: *Ask coach about this* on an exercise row navigates to `/chat?prefill=...`, and `chat-page-client` reads the param into the composer's initial value without sending it. One small, isolated addition.

### 5.3 Page composition

New feature folder `src/features/workout/components/`, built per [`design-system.md`](./design-system.md). Reuse the existing glyph set (`Tick`, `SkipMark`, `SwapMark`, `NoteMark`, `PlayMark`, `RestMark`, `KitMark`, `WeekMark`, `Caret`) and control primitives from `features/chat/components/ui/` rather than inventing a second vocabulary. `TodayCard` and `plan-tab` stay where they are and keep serving the chat panel — the home page gets its own, roomier components instead of being wedged into the 380px panel layout.

```
┌──────────────────────────────────────────────────────┐
│ Header — wordmark · "Ask coach" · account menu       │
├──────────────────────────────────────────────────────┤
│ WeekStrip — M T W T F S S, done / today / rest       │
├──────────────────────────────────────────────────────┤
│ SessionHeader                                        │
│   Monday · Push  ·  45 min  ·  3 of 6 done           │
│   [ Start session ]    [ Adjust ▾ ]                  │
│   ⓘ Adjusted for today: shoulder pain  (Reset)       │
├──────────────────────────────────────────────────────┤
│ ExerciseList — one row per session exercise          │
│   ▸ Bench Press   3 × 10 · barbell      [✓] [↷] [⋯]  │
│     (expanded: image, instructions, note field)      │
│   ▸ …                                                │
├──────────────────────────────────────────────────────┤
│ SessionFooter — [ Finish session ]                   │
└──────────────────────────────────────────────────────┘
```

Components:

| Component | Responsibility |
|---|---|
| `week-strip.tsx` | Seven days from `WeekDaySummary[]`; today emphasized; rest days quiet. Read-only in v1. |
| `session-header.tsx` | Day label, focus, target minutes, progress count, primary action, adjustment banner + *Reset to plan* |
| `exercise-list.tsx` | Ordered rows, expand/collapse, keyboard reachable |
| `exercise-row.tsx` | Per-exercise: done / skip / note / swap / remove, "swapped for today" marker |
| `adjust-sheet.tsx` | *Shorter today* (minutes + trim) · *Swap an exercise* · *Add an exercise* · *Skip today* |
| `plan-week.tsx` | Full active plan, collapsed by day — read-only; edits route to the coach |
| `rest-day.tsx` | Rest-day state with an *Add a light session* escape hatch |
| `empty-plan.tsx` | Defensive only; the page redirects before this renders |

### 5.4 State

`src/features/workout/use-workout-session.ts` — one hook, same shape of responsibility as `use-chat-conversation.ts`:

- Seeded from the server-rendered `{ session, week, plan }`; no fetch on mount.
- **Optimistic writes.** Marking done updates local state immediately, then `PATCH`es; on failure it rolls back and raises a `toast.error`. The design system calls for instant feedback, and the existing `setExerciseLog` already works this way.
- Writes are serialized per exercise id so fast double-taps can't land out of order.
- Progress (`doneCount` / `total`) and derived session status are computed client-side from the same rule the server uses, so the optimistic view matches the write.
- Finishing the session fires a celebratory toast (see the design system's "celebratory moments").

### 5.5 Keeping the two surfaces in sync

Chat and home can be open at once, and the coach can change today's session. v1 keeps this cheap and honest, with no sockets:

- `/home` re-reads on window focus and on `visibilitychange` (a short staleness guard so tab-flipping doesn't hammer the API).
- After an adjustment made in chat, the coach's existing `plan_updated`/`session_mutation` widgets already repaint the chat panel; `/home` picks the change up on its next focus.
- Mutations in `/home` that change the plan (none in v1 — all home edits are day-scoped) would need `router.refresh()`; noted so the rule is explicit.

---

## 6. Phasing

Each phase ends at a point where the app is shippable and `/chat` is untouched.

### Phase 1 — Backend foundation (no UI) — **done**
1. `src/lib/date/today.ts`; replace the four duplicated date helpers.
2. `src/models/workout-session.ts` + export from `models/index.ts`.
3. `src/features/workout/types.ts`.
4. `src/features/workout/lib/session-store.ts` — `ensureSession`, `getSession`, `getSessionRange`, `setExerciseStatus`, `setSessionStatus`, `deriveSessionStatus`.
5. `src/features/workout/lib/adapters.ts` — `sessionToDayLog`.
6. Re-point `PATCH /api/coach/today-log`, `getConversationData()`, and `GET /api/coach/conversation` at the store via the adapter, and `DELETE /api/coach/conversation` at session deletion. **Chat behavior must be byte-identical; verify by marking exercises done in the chat panel and reloading.**
7. Delete `dailyLogs` and its sub-schemas from `models/conversation.ts`; drop stale dev rows.

*Done when:* the chat Today card still works end to end, and its state now lives in `workout_sessions`.

### Phase 2 — The home page — **done**
8. `applySessionAdjustment`, `resetSessionToPlan` in the store.
9. The six `/api/workout/*` routes.
10. `/home` route, redirect logic, `constants.ts` + `proxy.ts` + post-sign-in target.
11. `use-workout-session.ts` and the components in §5.3.
12. Cross-links in both headers; `?prefill=` in the chat composer.

*Done when:* a user with a plan can open `/home`, work through today, adjust it, and see it reflected in `/chat` after a refresh — and a user without a plan lands in `/chat`.

### Phase 3 — Coach writes to the session (optional, after 1–2)
13. New agent tool `adjust_today_session` — day-scoped edits that write a session, not the plan.
14. Point the existing `session_mutation` widget at it, so "30 minutes and a sore shoulder" becomes durable instead of cosmetic.
15. Feed the current session into the coach's per-request context block in `api/coach/chat`, next to the active plan, so it stops guessing at today's progress.

This is the one phase that touches coach behavior; it is deliberately last and independently revertable.

### Phase 4 — Later
Per-set logging (`setLogs`), a progress/history surface over `getSessionRange`, streaks, rest timer.

---

## 7. Decisions

**Settled:**

1. **Route name** — `/home`.
2. **Landing** — authenticated users land on `/home`. `/home` redirects to `/chat` when there is no active plan, and `/chat` is where a user without a plan stays until they have one.
3. **`dailyLogs`** — deleted outright. Nothing has launched; no migration.

**Still open (defaulting as specced unless changed):**

4. **Week strip interactivity** — read-only in v1. Making past days tappable needs a date-scoped variant of the page; deferred.

---

## 8. Risks

| Risk | Mitigation |
|---|---|
| Regressing the chat Today card while re-pointing its storage | Adapter preserves the exact `DayLog` shape; Phase 1 ends with a manual pass over the chat panel before any UI work starts |
| Two tabs materializing the same date | Unique `{ userId, date }` index + treat duplicate-key as "re-read and return" |
| UTC/local date mismatch producing orphan logs | §3.5 — single local-date helper, and a server-side sanity window on every accepted `date` |
| Session drifting from a plan the user later replaces | Sessions store `planId`/`planVersion` and denormalized exercise data, so old sessions stay truthful; new dates materialize from the new plan |
| Coach and home page disagreeing about today's state | One `deriveSessionStatus` rule server-side; focus-revalidation on `/home`; Phase 3 puts the session in the coach's context |
