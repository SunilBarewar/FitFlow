# Design principles

Use this file while implementing. The UI should look intentional, not like a generic template.

## Layout

- One clear visual hierarchy: page title, supporting description, then the work area.
- Consistent spacing and alignment. Group related fields. Give the primary content room.
- One obvious primary action; secondary actions quieter; destructive actions visually distinct.
- Avoid nested cards, extra borders, and wrappers that do not group meaning.
- Ordinary utility screens do not need a hero.

## Typography

- Use Geist (already on `body`). Distinct sizes for title, section, body, helper, and metadata.
- Body text stays readable. Do not shrink helper text into noise.
- Weight signals hierarchy. Do not bold everything.

## Color and components

- Use CSS variables from `src/index.css` (`background`, `foreground`, `muted`, `primary`, `destructive`, `ring`, radius tokens).
- Color communicates state and meaning. Destructive color is for destructive work only.
- Never rely on color alone for error, success, or selection.
- Inputs, buttons, and dialogs should look like one system. Prefer shadcn / Base UI primitives.
- Hover, focus, selected, disabled, and pressed states should be recognizable.
- Icons support labels; they do not replace them unless the control is a well-known icon-only action with an accessible name.

## Responsive

- Design narrow and wide. No horizontal overflow.
- Comfortable touch targets. Stack or simplify tables, dialogs, and filter bars on small screens — do not only shrink the desktop layout.

## Motion

- Short motion only when it explains a change (dialog open, submit spinner, selection).
- Respect `prefers-reduced-motion`. Never delay the action with decoration.

## Do not default to

- A card around every section
- Gradients on buttons or headings
- Random decorative icons or pills
- Several competing accent colors
- Oversized titles
- Fake charts, vanity metrics, or invented product claims
- Lorem ipsum when realistic content is available

A simple form is “designed” when spacing, type, and labels are clear.

## Forms, confirmations, async, a11y

- Labels stay visible. Associate errors with fields. Validate on submit, then help while the user fixes.
- Confirmations name the affected thing and the consequence. Safe choice is easy to hit.
- Show progress during network work. Do not mark success early.
- Semantic HTML, keyboard path, focus ring, dialog focus trap, live feedback for important async results.
