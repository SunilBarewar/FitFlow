# Examples

Each example is a decision pattern, not a template to copy pixel-for-pixel. Adapt to the product, then implement the states.

## A. Report a problem with a delivered order

**Goal:** Customer tells the store what went wrong with a delivered item.

**Flow:** Orders → Order details → Report a problem → Reason → Details → Submit → Confirmation.

**Decisions:**
- Keep the action on the order, not a generic help form.
- Title: `Report a problem`. Description: `Tell us what happened with {product name} (order {id}).`
- Visible radios for a small exclusive set: Damaged product, Not working, Wrong item, Missing item, Other.
- Description optional except for Other (`What happened?` required).
- Photo attach only if it helps this product type.
- Primary button: `Submit report`. Secondary: `Back to order`.

**States:** loading on submit, success confirmation, recoverable error. Failed submit must not clear the description or mark the order as reported.

## B. Cancel a doctor's appointment

**Goal:** Patient cancels an upcoming visit without accidental taps.

**Flow:** Appointments → Appointment → Cancel → Confirm → Updated list/detail.

**Decisions:**
- Cancel is secondary, not the page's primary action.
- Dialog title: `Cancel this appointment?`
- Body names doctor, date, time, and any cancellation policy.
- Actions: `Keep appointment` (safe, prominent or equal) and `Cancel appointment` (destructive, explicit).
- Status changes only after the request succeeds.

**States:** confirming, submitting, success, failure with retry. Do not trick the user into keeping the appointment.

## C. Add a payment method

**Goal:** User saves a card or UPI ID.

**Flow:** Payments → Add payment method → Choose type → Fill fields → Verify → Saved.

**Decisions:**
- Title: `Add a payment method`. Description: `Cards and UPI are saved for future checkouts.`
- Choose method first; show only that method's fields.
- Card: labeled number, expiry, CVC with correct input types. UPI: `UPI ID` plus format help (`name@bank`).
- Switching methods must not leave stale hidden values that submit.
- Button: `Save payment method`. Do not say it was added until save/verify succeeds.
- Never display full PAN after save.

**States:** validation, verifying, success, verification failure with input preserved.

## D. Calorie tracker

**Goal:** User records today's intake in a way that matches how they actually know the number.

**Decisions:**
- If they estimate: labeled ranges (`Light`, `Moderate`, `Heavy`) with kcal underneath. Title: `How much did you eat today?`
- If they track precisely: numeric field `Calories` with unit and a short why (`Used to log daily totals`).
- Do not imply a range is universally healthy. Keep numbers visible when they affect the choice.

**States:** selected estimate or valid number, invalid number, saved.

## E. Searchable product listing

**Goal:** Shopper finds products by text, category, price, and attributes.

**Flow:** Catalog → Search/filter → Results → Product.

**Decisions:**
- Search field labeled `Search products`.
- Independent filters as checkboxes; exclusive sort/price band as radios or select depending on count and space.
- Show applied filters as removable chips (`Clear all` when several are on).
- Result count in plain language (`12 products`). Empty: `No products match these filters` plus `Clear filters`.
- Mobile: filters in a sheet or stacked section, not a cramped sidebar.

**States:** loading results, results, none, request failure. Changing or clearing filters always updates the list consistently.

## F. File upload

**Goal:** User attaches a document that meets format and size rules.

**Decisions:**
- Title: `Upload document`. Helper before the control: accepted types and max size.
- Drop zone or file button labeled `Choose file`. After select, show the filename, not a generic `file.selected`.
- Allow replace/remove when the task allows another try.
- Button: `Upload`. Success only after the upload finishes.

**States:** idle, selected, uploading, success, type/size error, network failure with retry. Do not clear a valid selection on an unrelated error.
