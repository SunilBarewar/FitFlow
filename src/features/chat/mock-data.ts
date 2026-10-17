import type { Plan, ProgressStats, TodayWorkout } from "./types";

export const mockProfile = {
  name: "Sunil",
  goal: "Build strength, 3x a week",
  experience: "beginner" as const,
  completeness: 70,
};

export const mockActivePlan: Plan = {
  id: "plan-1",
  name: "3-Day Strength Foundations",
  version: 2,
  status: "active",
  daysPerWeek: 3,
  minutesPerSession: 40,
  days: [
    {
      id: "day-1",
      label: "Day 1",
      focus: "Full body",
      exercises: [
        {
          id: "ex-1",
          name: "Goblet squat",
          sets: 3,
          reps: "10",
          equipment: "Dumbbell",
        },
        {
          id: "ex-2",
          name: "Dumbbell bench press",
          sets: 3,
          reps: "10",
          equipment: "Dumbbell",
        },
        {
          id: "ex-3",
          name: "Bent-over row",
          sets: 3,
          reps: "12",
          equipment: "Dumbbell",
        },
      ],
    },
    {
      id: "day-2",
      label: "Day 2",
      focus: "Lower body",
      exercises: [
        {
          id: "ex-4",
          name: "Romanian deadlift",
          sets: 3,
          reps: "10",
          equipment: "Dumbbell",
        },
        {
          id: "ex-5",
          name: "Walking lunge",
          sets: 3,
          reps: "12",
          equipment: "Dumbbell",
        },
        {
          id: "ex-6",
          name: "Glute bridge",
          sets: 3,
          reps: "15",
          equipment: "Bodyweight",
        },
      ],
    },
    {
      id: "day-3",
      label: "Day 3",
      focus: "Upper body",
      exercises: [
        {
          id: "ex-7",
          name: "Overhead press",
          sets: 3,
          reps: "8",
          equipment: "Dumbbell",
        },
        {
          id: "ex-8",
          name: "Incline row",
          sets: 3,
          reps: "12",
          equipment: "Bench",
        },
        {
          id: "ex-9",
          name: "Bicep curl",
          sets: 3,
          reps: "12",
          equipment: "Dumbbell",
        },
      ],
    },
  ],
};

export const mockTodayWorkout: TodayWorkout = {
  dayLabel: "Day 1",
  focus: "Full body",
  minutes: 40,
  exercises: mockActivePlan.days[0].exercises,
};

export const mockProgress: ProgressStats = {
  streakDays: 6,
  weeklyCompleted: 2,
  weeklyTarget: 3,
  totalWorkouts: 42,
  recentSessions: [
    { label: "Mon", completed: true },
    { label: "Tue", completed: false },
    { label: "Wed", completed: true },
    { label: "Thu", completed: false },
    { label: "Fri", completed: false },
    { label: "Sat", completed: false },
    { label: "Sun", completed: false },
  ],
};

export const EQUIPMENT_OPTIONS = [
  { id: "dumbbells", label: "Dumbbells" },
  { id: "bench", label: "Bench" },
  { id: "barbell", label: "Barbell" },
  { id: "bands", label: "Resistance bands" },
  { id: "bodyweight", label: "Bodyweight only" },
  { id: "gym", label: "Full gym" },
];

export function buildGeneratedPlan(input: {
  daysPerWeek: number;
  minutesPerSession: number;
  equipment: string[];
}): Plan {
  const usesDumbbells =
    input.equipment.includes("dumbbells") || input.equipment.length === 0;
  const equipmentLabel = usesDumbbells ? "Dumbbell" : "Bodyweight";

  const dayTemplates = [
    {
      focus: "Full body",
      exerciseNames: ["Goblet squat", "Push-up", "Bent-over row"],
    },
    {
      focus: "Lower body",
      exerciseNames: ["Romanian deadlift", "Walking lunge", "Glute bridge"],
    },
    {
      focus: "Upper body",
      exerciseNames: ["Overhead press", "Incline row", "Bicep curl"],
    },
    {
      focus: "Core & conditioning",
      exerciseNames: ["Plank", "Dead bug", "Step-up"],
    },
    {
      focus: "Full body",
      exerciseNames: ["Split squat", "Floor press", "Face pull"],
    },
  ];

  const days = dayTemplates
    .slice(0, input.daysPerWeek)
    .map((template, index) => ({
      id: `generated-day-${index + 1}`,
      label: `Day ${index + 1}`,
      focus: template.focus,
      exercises: template.exerciseNames.map((name, exIndex) => ({
        id: `generated-ex-${index + 1}-${exIndex + 1}`,
        name,
        sets: 3,
        reps: exIndex === 0 ? "10" : "12",
        equipment: equipmentLabel,
      })),
    }));

  return {
    id: "plan-generated",
    name: `${input.daysPerWeek}-Day Beginner ${equipmentLabel} Plan`,
    version: mockActivePlan.version + 1,
    status: "draft",
    daysPerWeek: input.daysPerWeek,
    minutesPerSession: input.minutesPerSession,
    days,
  };
}
