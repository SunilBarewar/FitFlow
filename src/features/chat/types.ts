export type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  equipment: string;
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

export type LoggedSet = {
  exerciseId: string;
  setIndex: number;
  done: boolean;
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

export type ProgressStats = {
  streakDays: number;
  weeklyCompleted: number;
  weeklyTarget: number;
  totalWorkouts: number;
  recentSessions: { label: string; completed: boolean }[];
};

export type Profile = {
  name: string;
  goal: string;
  experience: "beginner" | "intermediate" | "advanced";
  completeness: number;
};

export type PanelTab = "today" | "plan" | "progress";

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
