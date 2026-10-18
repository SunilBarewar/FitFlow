# FitFlow Generative Chat UI

## Purpose

FitFlow should feel like a capable, attentive fitness coach—not like a form hidden inside a chat window.

The conversation is how a user expresses intent in ordinary language. The interface is how the product makes each next step clear, easy to complete, and safe. The assistant should ask only for information that is necessary for the user's current request, render the best input control for each answer, remember answers already given, and visibly explain the outcome of meaningful changes.

This document specifies the conversational UX, the generative UI contract, and the safety boundaries for the first version of FitFlow.

## Product principles

1. **Intent first, profile second.** Do not force every visitor through full onboarding. Gather the minimum information required to answer the request safely and usefully.
2. **Ask one useful question at a time.** A short sequence with a visible reason is easier than a long questionnaire.
3. **Use UI when it reduces effort.** Use option chips, toggles, steppers, and confirmation cards for constrained answers. Keep a text composer available for nuance.
4. **Chat confirms intent; cards show consequences.** A saved plan, plan change, exercise substitution, or weekly insight must appear as a visible structured object—not only in a message.
5. **Never ask a question twice.** Previously supplied profile data, accepted preferences, and recent context should be reused and editable.
6. **Preserve user agency.** The coach may recommend and draft. The user approves durable plan changes and can undo them.
7. **Safety overrides smoothness.** Pain, injuries, medical conditions, and potentially urgent symptoms require a safe response path, not a persuasive coaching flow.

## The application shell

FitFlow has four primary destinations:

- **Coach** — the default surface. It combines the active plan, contextual actions, conversation, and dynamic UI.
- **Plan** — the current week, workout details, planned progression, and planned changes.
- **Progress** — completed sessions, consistency, exercise trends, and weekly reviews.
- **Profile** — stable goals, equipment, availability, preferences, and limitations.

The **Coach** screen is the home screen. The user should not choose between “dashboard mode” and “chat mode.” Chat is the control layer for the visible plan and progress surfaces: picking a suggestion or answering a question in chat is what drives what the plan/progress surface shows next, live, without navigating anywhere.

### Final layout decision: one surface, two responsive arrangements

Rather than a literal fixed 50/50 split or two separate screens, Coach is a single component tree with state (`CoachContext`, the rendered `UiBlock`s, and the live plan/progress snapshot) that renders into one of two arrangements depending on viewport width. Same state, same server contract — only the arrangement changes.

**Desktop / tablet (≥ ~1024px) — true split pane:**

```
┌───────────────────────┬─────────────────────┐
│ Context bar (goal, streak, profile ring)    │
├───────────────────────┼─────────────────────┤
│                       │ Today | Plan | Progress │
│   Chat feed +         │─────────────────────│
│   composer            │ Live panel content:  │
│   (control layer)     │ today's workout,     │
│                       │ plan preview, or     │
│                       │ progress — updates   │
│                       │ live as chat answers │
│                       │ are given            │
└───────────────────────┴─────────────────────┘
```

The right pane is always visible. When an answer in chat changes what the user should see (a plan is generated, today’s session is adjusted, the user asks about progress), the pane switches tab and shows a brief highlight pulse on the tab that changed — the “live” feeling is the point of choosing this layout over two separate screens.

**Mobile (< 1024px) — stacked, with the live panel as a bottom sheet:**

```
┌─────────────────────────┐
│ Context bar              │
├─────────────────────────┤
│ Compact pinned summary   │  ← tap to expand
│ (today's workout / plan  │
│  name / streak — whatever│
│  tab is currently “live”)│
├─────────────────────────┤
│ Chat feed + composer     │
└─────────────────────────┘
```

Tapping the pinned summary opens the same Today/Plan/Progress panel as a full-screen bottom sheet. A literal two-column split doesn’t work at phone width (both panes become too narrow to use), so mobile keeps chat as the primary surface and treats the live panel as on-demand detail, one tap away — never a separate screen requiring navigation.

Implemented in `src/components/coach/coach-shell.tsx` (the responsive switch), `live-panel.tsx` (the Today/Plan/Progress tabs, shared by both arrangements), and `mobile-pinned-card.tsx` (the mobile summary + bottom sheet).

## Generative UI model

The model does not return arbitrary HTML or React code. It returns a bounded, validated response that contains:

1. Natural-language assistant text.
2. A small set of UI blocks from a controlled component registry.
3. A structured decision describing whether more information, a recommendation, a preview, or user confirmation is required.

The frontend renders only known block types. The server validates block schemas, user permissions, exercise IDs, and action payloads before a response reaches the browser.

### Why bounded UI generation

Allowing a model to invent UI components causes inconsistency, unsafe actions, poor accessibility, and fragile rendering. FitFlow should be generative in **content, question selection, option selection, and sequence**, while the visual language remains consistent and testable.

### Initial component registry

| Block | When it appears | User action |
| --- | --- | --- |
| `choice_chips` | Small, mutually exclusive answers such as experience level | Select one option |
| `multi_select_chips` | Equipment, available days, exercise dislikes | Select multiple options |
| `number_stepper` | Workout duration, days per week, weight/reps | Increment, decrement, or type |
| `body_area_selector` | Location of non-urgent discomfort | Select body region and optional side |
| `free_text_prompt` | Context that cannot be safely reduced to options | Type a response |
| `plan_preview` | A generated plan or plan mutation | Review, edit, accept, or decline |
| `workout_card` | Today’s recommended session | Start, shorten, move, or modify |
| `exercise_substitution` | An exercise needs replacement | Compare and choose |
| `set_logger` | An active workout is in progress | Log reps, load, effort, and skip reason |
| `check_in` | End of workout or weekly reflection | Choose effort or add a note |
| `safety_notice` | Pain or medical-risk conversation | Acknowledge and choose a safe next step |

The assistant should normally attach one primary block to a message. Multiple blocks are appropriate only when the user must make connected choices, such as selecting equipment and available training days.

## Conversation state machine

Every message is classified into one of these states before the assistant drafts a reply:

```text
new / unknown user
        ↓
intent understood
        ├── enough information → recommend, generate, or modify
        └── missing information → ask a targeted follow-up
                                      ↓
                             answer captured and validated
                                      ↓
                           plan preview / workout / insight
                                      ↓
                              explicit user action or confirmation
```

The current conversation state must be persisted server-side. The model should receive a compact context object, not raw messages alone.

### Context object

```ts
type CoachContext = {
  userId: string;
  intent:
    | "create_plan"
    | "daily_recommendation"
    | "modify_today"
    | "replace_exercise"
    | "log_workout"
    | "progress_review"
    | "pain_or_discomfort"
    | "general_fitness_question"
    | "unknown";
  profile: {
    goal?: string[];
    experience?: "beginner" | "intermediate" | "advanced";
    equipment?: string[];
    availability?: { daysPerWeek?: number; minutesPerSession?: number };
    limitations?: string[];
    preferences?: string[];
  };
  activePlan?: { id: string; version: number; status: "draft" | "active" };
  currentSession?: { id: string; status: "not_started" | "active" | "completed" };
  missingFacts: string[];
  safetyStatus: "normal" | "screening" | "restricted" | "urgent";
};
```

`missingFacts` is calculated by application code based on the current intent. The model can decide how to phrase a question, but not what required data can be skipped.

## Question policy

### Ask only the minimum viable question set

Required information depends on the intent:

| User intent | Required before a durable recommendation | Optional follow-ups |
| --- | --- | --- |
| Build a weekly plan | goal, experience, days/week, minutes/session, equipment, limitations | preferred training style, disliked exercises |
| Suggest today’s workout | active plan or goal, time available, equipment today, current limitation status | energy level |
| Make today lighter | active workout, time available, energy level, equipment today | reason for lower intensity |
| Replace an exercise | exercise to replace, available equipment, reason for replacement | muscle focus preference |
| Track progress | completed sessions and enough comparable set data | subjective check-in |
| Discomfort/pain question | safety screen, location, onset, pain context, movement relationship | severity trend, prior diagnosis only if voluntarily offered |

### Question-writing rules

- Explain why when the question is personal or may feel intrusive.
- Offer concise options plus “Something else.”
- Keep neutral language; do not imply that the user failed.
- Do not pretend certainty when the answer depends on assessment by a clinician.
- Prefer a single follow-up with a meaningful branch over a generic “Tell me more.”
- If the user gives several facts in one message, acknowledge and store them before asking anything else.

### Good and poor question examples

Poor:

> What is your age, weight, height, exercise level, injury history, goal, diet, and available equipment?

Better:

> I can build that plan. First, how many days each week can you realistically train?

```json
{
  "type": "choice_chips",
  "field": "availability.daysPerWeek",
  "options": ["2 days", "3 days", "4 days", "5+ days", "My schedule varies"]
}
```

Poor:

> Do you have back pain? Please provide more details.

Better:

> I’m sorry you’re dealing with that. To avoid suggesting the wrong movements, where is the discomfort most noticeable?

```json
{
  "type": "body_area_selector",
  "field": "discomfort.location",
  "options": ["Upper back", "Mid back", "Lower back", "Not sure"]
}
```

## Key conversational journeys

### Journey A: a new user asks for a weekly plan

User:

> Build me a weekly workout plan.

The agent:

1. Identifies `create_plan`.
2. Retrieves any known profile facts.
3. Calculates missing plan requirements.
4. Asks one targeted question at a time, using structured input.
5. Summarizes known facts before generation.
6. Retrieves appropriate exercise candidates from MongoDB.
7. Generates a draft plan that references only retrieved exercise IDs.
8. Shows a `plan_preview`.
9. Activates the plan only after confirmation.

Example sequence:

```text
Assistant: I can do that. How many days a week can you realistically train?
User: 3 days.
Assistant: Great—about how much time do you have for each workout?
User: 30–45 minutes.
Assistant: What equipment can you use most weeks?
User: Dumbbells and a bench.
Assistant: Got it. How would you describe your current training experience?
User: Beginner.
Assistant: Any injuries, pain, or movements you want to avoid? This helps me keep the plan appropriate.
User: None.
Assistant: I’ll create a 3-day beginner dumbbell plan with 30–45 minute sessions.
[Plan preview]
```

The user can open an “Edit assumptions” control from the preview rather than restarting the conversation.

### Journey B: an existing user requests a lighter home workout

User:

> I’m not feeling energetic today. Give me something lighter that I can do at home.

The agent should infer:

- Intent: `modify_today`
- Existing plan: use it as the baseline
- Desired change: reduced duration/intensity, home-compatible equipment

It should ask only what remains unknown:

> I can adjust today without disrupting your week. How much time feels realistic?

Options: `10 min`, `20 min`, `30 min`, `Not sure`

Once answered, it presents a plan mutation:

```text
Today’s adjustment
• Duration: 35 min → 20 min
• Equipment: dumbbells → bodyweight
• Intensity: moderate → light
• Weekly plan: unchanged

[Start adjusted workout] [Keep original] [Change something]
```

The modified session should be stored as an instance of the active plan, with a `modificationReason` and the user’s accepted adaptation—not as an entirely new weekly plan.

### Journey C: a user reports back pain

User:

> I have back pain. Can you suggest exercises I can do daily?

This must use the `pain_or_discomfort` path. It is not a normal exercise recommendation request.

The assistant’s first response should:

1. Acknowledge without diagnosing.
2. State that it cannot assess or treat the cause.
3. Check for urgent warning signs before exercise suggestions.
4. Ask one non-diagnostic question that helps determine the safe response path.

Example:

> I’m sorry you’re dealing with that. I can share general, gentle movement ideas, but I can’t determine the cause of back pain. If you have severe or worsening pain, pain after a significant injury, weakness/numbness, fever, loss of bladder or bowel control, or pain with chest symptoms, seek urgent medical care instead of exercising.
>
> If none of those apply, where is the discomfort most noticeable?

The first block is a `safety_notice` with an acknowledgement action. The next block is `body_area_selector`:

- Upper back
- Mid back
- Lower back
- Not sure

Subsequent questions should be limited and purposeful:

1. Did this start after a fall, accident, or other significant injury?
2. Is the pain severe, getting worse, or accompanied by numbness, tingling, or weakness?
3. Does it noticeably worsen with a particular movement?
4. Has a clinician given you activity guidance for this issue? (optional; never request diagnosis details)

If warning signs are present or the user is unsure, FitFlow should not suggest an exercise routine. It should encourage appropriate professional evaluation.

If warning signs are absent, the response must be framed as general comfort movement, not treatment:

> If gentle movement feels comfortable and you have not been told to avoid it, you could try a short, low-intensity mobility routine. Stop if anything increases pain, causes numbness, or feels wrong.

The system should exclude high-load, high-impact, advanced, and pain-provoking exercises. It should not claim that an exercise “fixes,” “heals,” or “treats” back pain.

### Journey D: an active workout needs an exercise substitution

User:

> I don’t want to do lunges today. My knee feels uncomfortable.

The assistant should not simply replace the movement. It asks a safety-conscious clarification if needed:

> Is this new or sharp pain, or more like usual soreness/stiffness?

If it is normal soreness/stiffness and the user wants an alternative, display a comparison card:

```text
Replace: Dumbbell lunge
Goal: lower-body strength

Option A: Box squat — less balance demand
Option B: Glute bridge — avoids deep knee bend
Option C: Skip lower-body work today

[Choose an option] [Talk to coach]
```

The chosen replacement updates only the current session unless the user explicitly asks to change future workouts.

## Interaction design details

### Composer

The text composer always remains available, even when chips or cards are shown. A structured answer should be editable before it is sent.

Recommended behavior:

- Tapping a chip sends a semantic answer immediately when it is unambiguous.
- Multi-select components require an explicit `Continue` button.
- A “Something else” option opens inline text input rather than a new modal.
- The composer suggests contextual prompts but never autocompletes a decision.

### Assistant messages

An assistant message has three layers:

1. **Short human explanation** — what the assistant understands or why it asks.
2. **Interactive block** — the next easiest action.
3. **Secondary action** — “Edit details,” “Not sure,” “Skip for now,” or “Talk to coach.”

Avoid long prose above a required interaction. A user should be able to understand the purpose and act without reading a paragraph.

### Cards and confirmation

Use explicit confirmation when:

- Activating a new weekly plan.
- Replacing a future exercise across the plan.
- Changing training frequency, progression, or stated limitations.
- Saving a persistent preference.

Do not require confirmation when:

- Logging a set.
- Changing a rest timer.
- Selecting a quick reply.
- Making a one-session adjustment after the user clearly requested it.

For consequential changes, include an undo action after save.

### Visible memory

When the assistant learns a durable fact, show it compactly:

```text
I’ll remember: You prefer 30-minute home workouts.
[Edit] [Don’t save this]
```

Only persist a memory when it is stable, useful to future coaching, and either explicitly confirmed or very clearly stated by the user.

## API response contract

The chat API should return a schema resembling:

```ts
type CoachResponse = {
  messageId: string;
  text: string;
  intent: CoachContext["intent"];
  state: "question" | "recommendation" | "preview" | "active_session" | "safety";
  ui: UiBlock[];
  proposedUpdates?: {
    profilePatch?: Record<string, unknown>;
    planPatch?: Record<string, unknown>;
    sessionPatch?: Record<string, unknown>;
    memories?: Array<{ key: string; value: string; confidence: "high" | "confirmed" }>;
  };
  requiredAction?: "answer_question" | "accept_plan" | "acknowledge_safety" | "none";
};
```

Each `UiBlock` needs a stable `id`, a `type`, a validated data payload, and a server-issued `actionToken`. The browser sends the token and a constrained value back to the server; it never sends arbitrary document patches.

```ts
type ChoiceChipsBlock = {
  id: string;
  type: "choice_chips";
  prompt: string;
  field: string;
  options: Array<{ id: string; label: string; description?: string }>;
  allowCustomAnswer: boolean;
  actionToken: string;
};
```

## Data and persistence design

### Collections

- `fitnessProfiles`: stable user attributes and explicit preferences.
- `exercises`: normalized data imported from the exercise catalog.
- `workoutPlans`: versioned plan drafts and activated plans.
- `workoutSessions`: actual workout instances and logged outcomes.
- `conversationThreads`: thread metadata, compact state, and summary.
- `conversationMessages`: user/assistant text plus rendered UI block metadata.
- `coachMemories`: durable, user-visible facts with source and confirmation status.
- `safetyEvents`: minimal audit record for safety-path activation; avoid storing unnecessary medical detail.

### What belongs where

| Information | Store in |
| --- | --- |
| “I have dumbbells at home” | `fitnessProfiles.equipment` |
| “I prefer 30-minute sessions” | `fitnessProfiles.preferences` or confirmed `coachMemories` |
| “I skipped today due to low energy” | `workoutSessions` |
| “My knee felt uncomfortable during lunges” | session note; only promote to a limitation after confirmation |
| Full chat wording | `conversationMessages` |
| Conversation’s current missing question and intent | `conversationThreads.state` |
| Exercise candidates retrieved for a plan | short-lived request/session metadata, not durable profile data |

## AI orchestration

The first version needs one Coach Agent with deterministic tools, not multiple autonomous agents.

### Agent responsibilities

1. Classify intent and safety status.
2. Read profile, active plan, recent sessions, and conversation state.
3. Determine the smallest missing-information set.
4. Select a question template and matching UI block.
5. Retrieve eligible exercises from MongoDB.
6. Produce structured recommendations or plan drafts.
7. Request server-side validation before any durable update.

### Required tools

- `getCoachContext(userId)`
- `saveAnswer(actionToken, answer)`
- `searchExercises(filters)`
- `getActivePlan(userId)`
- `createPlanDraft(input, exerciseIds)`
- `previewPlanChange(planId, proposedChange)`
- `acceptPlanChange(changeId)`
- `createSessionAdaptation(sessionId, request)`
- `logSet(sessionId, setData)`
- `saveConfirmedMemory(userId, memory)`
- `recordSafetyPath(threadId, status)`

The agent must not write directly to MongoDB. Tools validate authorization, schemas, available equipment, exercise IDs, and user confirmation requirements.

## Exercise retrieval and recommendation

Exercise selection is deterministic before it becomes generative.

1. Filter the catalog by active status, experience level, available equipment, category, target muscles, and safety exclusions.
2. Rank the filtered candidates for movement balance, novelty, user preference, and plan continuity.
3. Provide only a small candidate set to the agent.
4. Require returned recommendations to use a candidate `exerciseId`.
5. Validate the final session for duration, volume, duplicate patterns, and contraindication rules.

The agent can explain *why* a movement is selected, but it cannot invent exercises or select an unavailable item.

## Safety policy

FitFlow provides general fitness education and should not diagnose, treat, or claim to rehabilitate an injury or condition.

### Escalate immediately

Stop normal exercise recommendations and direct the user to urgent or appropriate professional care if they mention, or cannot rule out:

- Severe, sudden, or rapidly worsening pain.
- A significant fall, accident, or suspected serious injury.
- Chest pain, trouble breathing, fainting, or unexplained severe dizziness.
- New weakness, numbness, tingling, loss of coordination, or changes in bladder/bowel control.
- Fever or systemic illness alongside significant pain.

### Restricted guidance

When non-urgent pain/discomfort is mentioned without warning signs:

- Ask limited screening questions.
- Recommend only general, gentle, comfort-based movement if appropriate.
- Encourage stopping any movement that worsens symptoms.
- Recommend clinical advice where symptoms persist, recur, or limit activity.
- Do not make causal claims or set rehab goals.

### Copy rules

Use:

- “I can share general movement ideas.”
- “If this feels comfortable.”
- “Stop if this increases pain or feels wrong.”
- “A qualified clinician can help assess the cause.”

Avoid:

- “This will fix your back pain.”
- “You have a muscle strain.”
- “This is safe for your condition.”
- “Do these exercises daily to heal.”

## Success metrics

Measure whether the interaction is useful, not simply whether the user sent messages.

- Percentage of new users who reach an approved plan.
- Median questions required before plan approval.
- Percentage of users who start a recommended workout.
- Workout completion rate.
- Rate of plan adaptations accepted versus rejected.
- Rate of assistant questions answered through UI blocks.
- Repeated-question rate: a user is asked for data already known.
- Safety-path activation and escalation correctness review.
- Weekly retention and sessions completed per active user.

## MVP scope

Build first:

1. Intent classification for plan creation, today’s workout, modification, substitution, and discomfort screening.
2. Controlled blocks: single choice, multi-select, number stepper, free text, plan preview, workout card, and safety notice.
3. Profile fact collection and visible confirmation.
4. MongoDB-backed exercise retrieval and validated plan drafts.
5. Today-workout adaptation and active session logging.
6. Explicit plan acceptance and durable plan versioning.

Defer:

- Voice coaching.
- Fully autonomous plan changes.
- Nutrition advice.
- Social feeds and challenges.
- Detailed medical or rehabilitation flows.
- Arbitrary model-created UI components.

## Final decision

FitFlow should be a **structured coaching conversation**: a user says what they need in natural language, the agent asks only the next useful question, and the interface turns the answer into an easy visible action. This combines the warmth and flexibility of chat with the clarity, trust, and speed of a dedicated fitness product.

Concretely, this means a single Coach surface — chat as the control layer, a live Today/Plan/Progress panel beside it on desktop and one tap away on mobile — rather than either a chat-only product or a separate dashboard the user has to navigate to. See “Final layout decision” above for the responsive arrangement.

**Status:** this layout is built as a UI/UX prototype against mock data at `src/app/(app)/chat/page.tsx` and `src/components/coach/**`, covering the plan-creation, lighter-today, back-pain-screening, and progress-check-in journeys described above. It is not yet wired to the real Coach Agent, MongoDB exercise retrieval, or persistence — see “MVP scope” for what real-data work remains.
