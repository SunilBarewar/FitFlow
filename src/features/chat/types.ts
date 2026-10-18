export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  equipment: string;
  instructions?: string[];
  muscles?: string[];
  /** Catalog-relative image paths, e.g. "3_4_Sit-Up/0.jpg" — build the full URL with exerciseImageUrl. */
  images?: string[];
};

export type ExerciseLogStatus = "pending" | "done" | "skipped";

export type ExerciseLogEntry = {
  exerciseId: string;
  status: ExerciseLogStatus;
  note?: string;
};

/** One calendar day's exercise log. Kept per-date so streaks and weekly/total
 * stats can be computed from history, not just "today". */
export type DayLog = {
  date: string;
  dayLabel: string;
  entries: ExerciseLogEntry[];
};

export type PlanDay = {
  id: string;
  label: string;
  focus: string;
  exercises: Exercise[];
};

export type Plan = {
  id: string;
  name: string;
  version: number;
  status: "draft" | "active";
  daysPerWeek: number;
  minutesPerSession: number;
  days: PlanDay[];
};

export type TodayWorkout = {
  dayLabel: string;
  focus: string;
  minutes: number;
  adjusted?: {
    reason: string;
    fromMinutes: number;
    fromEquipment: string;
    toEquipment: string;
  };
  exercises: Exercise[];
};

export type Profile = {
  name: string;
  goal: string;
  experience: "beginner" | "intermediate" | "advanced";
  completeness: number;
};

export type PanelTab = "today" | "plan";

export type ChoiceOption = { id: string; label: string; description?: string };

export type ChatBlock =
  | {
      type: "choice_chips";
      id: string;
      options: ChoiceOption[];
    }
  | {
      type: "multi_select_chips";
      id: string;
      options: ChoiceOption[];
    }
  | { type: "experience"; id: string }
  | { type: "muscle_focus"; id: string }
  | { type: "equipment_access"; id: string }
  | {
      type: "safety_notice";
      id: string;
      body: string;
      acknowledgeLabel: string;
    }
  | {
      type: "plan_created";
      id: string;
      plan: Plan;
    }
  | {
      type: "session_mutation";
      id: string;
      fromMinutes: number;
      toMinutes: number;
      fromEquipment: string;
      toEquipment: string;
      fromIntensity: string;
      toIntensity: string;
    }
  | {
      type: "gentle_routine";
      id: string;
      exercises: { name: string; detail: string }[];
    }
  | {
      type: "urgent_care";
      id: string;
    };

export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text?: string;
  block?: ChatBlock;
};
