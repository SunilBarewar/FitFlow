/**
 * Product-owned copy for plan-setup widgets.
 * Reply phrases are what the user bubble sends. Keep them identical to the
 * mapping tables in src/features/coach/agent/coach-instructions.ts.
 */

export type BodyRegion =
  | "neck"
  | "shoulders"
  | "chest"
  | "back"
  | "arms"
  | "forearms"
  | "abs"
  | "lowerBack"
  | "hips"
  | "thighs"
  | "calves";

export type SetupOption = {
  id: string;
  label: string;
  description: string;
};

export type MuscleOption = {
  id: string;
  label: string;
  region: BodyRegion;
};

export const EXPERIENCE_OPTIONS: SetupOption[] = [
  {
    id: "new",
    label: "Never really worked out before",
    description: "We'll keep your first plan simple and approachable.",
  },
  {
    id: "returning",
    label: "Worked out before, but not consistently (less than 6 months)",
    description: "We'll help you build a steady routine.",
  },
  {
    id: "regular",
    label: "I work out regularly (6+ months)",
    description: "We can use more variety and more challenging movements.",
  },
];

export const MUSCLES: MuscleOption[] = [
  { id: "abdominals", label: "Abdominals", region: "abs" },
  { id: "abductors", label: "Abductors", region: "hips" },
  { id: "adductors", label: "Adductors", region: "thighs" },
  { id: "biceps", label: "Biceps", region: "arms" },
  { id: "calves", label: "Calves", region: "calves" },
  { id: "chest", label: "Chest", region: "chest" },
  { id: "forearms", label: "Forearms", region: "forearms" },
  { id: "glutes", label: "Glutes", region: "hips" },
  { id: "hamstrings", label: "Hamstrings", region: "thighs" },
  { id: "lats", label: "Lats", region: "back" },
  { id: "lower back", label: "Lower back", region: "lowerBack" },
  { id: "middle back", label: "Middle back", region: "back" },
  { id: "neck", label: "Neck", region: "neck" },
  { id: "quadriceps", label: "Quadriceps", region: "thighs" },
  { id: "shoulders", label: "Shoulders", region: "shoulders" },
  { id: "traps", label: "Traps", region: "shoulders" },
  { id: "triceps", label: "Triceps", region: "arms" },
];

const LOWER_BODY_IDS = [
  "abductors",
  "adductors",
  "calves",
  "glutes",
  "hamstrings",
  "quadriceps",
] as const;

const UPPER_BODY_IDS = MUSCLES.map((muscle) => muscle.id).filter(
  (id) => !LOWER_BODY_IDS.includes(id as (typeof LOWER_BODY_IDS)[number]),
);

export const MUSCLE_PRESETS: {
  id: string;
  label: string;
  muscles: string[];
}[] = [
  { id: "full", label: "Full body workout", muscles: MUSCLES.map((m) => m.id) },
  { id: "upper", label: "Upper body workout", muscles: [...UPPER_BODY_IDS] },
  { id: "lower", label: "Lower body workout", muscles: [...LOWER_BODY_IDS] },
];

export type EquipmentOption = { id: string; label: string };

export const EQUIPMENT: EquipmentOption[] = [
  { id: "bands", label: "Bands" },
  { id: "barbell", label: "Barbell" },
  { id: "body only", label: "Body only" },
  { id: "cable", label: "Cable" },
  { id: "dumbbell", label: "Dumbbell" },
  { id: "e-z curl bar", label: "EZ curl bar" },
  { id: "exercise ball", label: "Exercise ball" },
  { id: "foam roll", label: "Foam roll" },
  { id: "kettlebells", label: "Kettlebells" },
  { id: "machine", label: "Machine" },
  { id: "medicine ball", label: "Medicine ball" },
  { id: "other", label: "Other" },
];

export const GYM_EQUIPMENT = EQUIPMENT.map((item) => item.id);
export const HOME_EQUIPMENT = ["body only"];

export function sameIdSet(a: readonly string[], b: readonly string[]) {
  if (a.length !== b.length) return false;
  const right = new Set(b);
  return a.every((id) => right.has(id));
}

export function activeBodyRegions(muscleIds: readonly string[]) {
  const regions = new Set<BodyRegion>();
  for (const muscle of MUSCLES) {
    if (muscleIds.includes(muscle.id)) regions.add(muscle.region);
  }
  return regions;
}

function joinLabels(labels: string[]) {
  if (labels.length <= 1) return labels[0] ?? "";
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, and ${labels.at(-1)}`;
}

export function muscleReply(ids: readonly string[]) {
  const preset = MUSCLE_PRESETS.find((item) => sameIdSet(item.muscles, ids));
  if (preset) return preset.label;
  const labels = MUSCLES.filter((muscle) => ids.includes(muscle.id)).map(
    (muscle) => muscle.label,
  );
  return `Train these areas: ${joinLabels(labels)}`;
}

export function equipmentReply(ids: readonly string[]) {
  if (sameIdSet(ids, GYM_EQUIPMENT)) return "I have gym access";
  if (sameIdSet(ids, HOME_EQUIPMENT)) {
    return "I'll work out at home with no equipment";
  }
  const labels = EQUIPMENT.filter((item) => ids.includes(item.id)).map(
    (item) => item.label,
  );
  return `I can use ${joinLabels(labels)}`;
}
