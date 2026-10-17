---
name: ui-builder
description: Build clean, usable, accessible React interfaces in this project from product requirements. Use whenever the user wants a UI, component, form, page, screen, dashboard, settings, checkout, onboarding, CRUD flow, modal, or machine-coding interview feature — even if they do not say "UI" or "skill". Prefer this skill over generating generic components.
---

# UI Builder

Turn requirements into working interfaces that help people finish a task with as little confusion as possible.

This project is Vite + React 19 + TypeScript + Tailwind 4 + shadcn (`base-nova`) + Base UI + Lucide + Geist. Follow those conventions. Do not introduce another framework or styling system.

Read [design-principles.md](design-principles.md) before implementing visual or interaction details. Read [examples.md](examples.md) when the task matches a similar flow (report, cancel, payment, filters, upload, estimates vs numbers).

## Goal

Ship a complete experience: hierarchy, copy, interaction, states, and code that fits this repo. Visual polish supports usability; it does not replace it.

## Copy

Write titles, descriptions, labels, helper text, empty states, errors, and buttons as if a real person will read them.

- Name the screen after the user's goal (`Report a problem`, not `IssueTicketForm`).
- Labels say what to enter or choose (`Card number`, not `Input 1` or `value`).
- Helper text explains the decision (`About 1,800–2,200 kcal for a typical day`), not the implementation.
- Buttons use verbs plus the object (`Cancel appointment`, `Add card`, `Save changes`). Avoid `Submit` / `OK` / `Click here` unless the action is truly generic.
- Errors tell the user what happened and what to do (`Enter a UPI ID like name@bank`).
- Do not dump internal or medical jargon into the UI. Keep accuracy when numbers matter; put them in supporting text.

## Principles

1. **Understand the user first.** Who are they, what are they trying to finish, what could confuse them, and what does success look like?
2. **Optimize the task, not the widget count.** Fewer steps, obvious next action, information at the right time. Do not default to modals, cards, tabs, or multi-step forms.
3. **Assume and move.** Fill gaps with sensible defaults. Ask only when a missing fact would change the UX, data, or behavior. In interview-style tasks, build a coherent working UI quickly.
4. **Build the whole experience.** Loading, empty, error, validation, success, and recovery where they matter. No decorative controls that do nothing.
5. **If the user already specified the design, follow it.** Infer the rest.

## Workflow

**Understand → Decide → Implement → Verify → Refine**

Keep this internal. In the reply, implement first; summarize briefly at the end.

### Understand

Inspect the request and the repo (`package.json`, `components.json`, `src/`, existing UI). Note the user, the one-sentence job, and what “done” looks like.

### Decide (quickly, before code)

For small tasks this can be a few lines of thought. For larger tasks, decide flow and component boundaries first.

1. Task and user goal (one sentence).
2. Flow from entry to done, including back/cancel.
3. What is primary vs secondary vs only-after-a-choice.
4. Controls that match the task (see pattern table below).
5. States that are actually needed.
6. Acceptance checks you can observe in the UI.

### Implement

Fit the existing app. Reuse `@/components/ui` and tokens. Add shadcn pieces with the project's CLI when needed. Keep architecture proportional — no extra providers, stores, or hooks for a small screen.

Use realistic copy and mock data. Mock network calls only when there is no backend; never fake success before the operation finishes.

### Verify

Run what this repo supports: `npm run build` and `npm run lint` when the change is substantial. Check the primary path, failures, keyboard use, and a narrow viewport. Do not claim checks passed unless they ran.

If browser tools are available and the UI is user-visible, exercise the flow rather than only screenshotting.

### Refine

Fix broken interactions, missing states, unclear copy, and layout issues. Stop when acceptance criteria are met.

## Control defaults

Choose from the task, not habit:

| Need | Prefer |
|---|---|
| Few visible exclusive options | Radio |
| Many exclusive options | Select |
| Independent multi-select | Checkboxes |
| Immediate on/off | Switch |
| Few exclusive views | Segmented control |
| Large/searchable set | Combobox |
| Continuous range, precision optional | Slider |
| Short structured value | Input (correct `type`) |
| Longer free text | Textarea |
| Compare options with context | Cards |
| Short focused confirm or contained task | Dialog |
| Complex or important workflow | Dedicated page |

## Must-handle behavior

**Forms:** Persistent labels, right input types, validate on submit first, field-level errors for field problems, keep valid input on failure.

**Destructive actions:** Name the item, state consequences, use explicit labels (`Keep appointment` vs `Cancel appointment`). Confirm when impact warrants it; do not hide the action in dark patterns.

**Async:** Loading, prevent double submit, success only after success, retry without wiping input.

**Accessibility:** Semantic HTML, keyboard, visible focus, labeled controls, dialog focus, names for icon-only buttons, `prefers-reduced-motion`, contrast, usable hit targets. Do not trade a11y for decoration.

## React in this repo

- Inspect `src/` before adding files. Put UI in `src/components/` (primitives in `src/components/ui/`).
- Use `cn` from `@/lib/utils`, Geist via existing CSS, Lucide for icons that earn their place.
- Controlled state for forms and anything that must stay predictable.
- Stable list keys. Semantic elements, not clickable `div`s.
- Do not rewrite unrelated files or restyle the design tokens without a reason.

## What to say when done

Short: what was built, important assumptions, and any limits (mocked API, skipped backend, etc.). Explain design only when asked, when a choice is non-obvious, or when it prevents a wrong follow-up.

## Checklist

- [ ] Primary goal is obvious; copy is meaningful
- [ ] Flow is short; next action is clear
- [ ] Interactive controls work, including failure/retry
- [ ] Relevant states exist; input is preserved on error
- [ ] Layout, type, and color use project tokens and a clear hierarchy
- [ ] Keyboard + narrow screen work
- [ ] Complexity matches the task
