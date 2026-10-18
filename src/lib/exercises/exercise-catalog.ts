import { readFileSync } from "node:fs";
import path from "node:path";

export type ExerciseLevel = "beginner" | "intermediate" | "expert";

export type ExerciseRecord = {
  id: string;
  name: string;
  level: ExerciseLevel;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  category: string;
  instructions: string[];
  images: string[];
};

let cache: ExerciseRecord[] | null = null;

function loadCatalog(): ExerciseRecord[] {
  if (cache) return cache;
  const filePath = path.join(process.cwd(), "excercises.json");
  const raw = readFileSync(filePath, "utf-8");
  cache = JSON.parse(raw) as ExerciseRecord[];
  return cache;
}

export type ExerciseSearchFilters = {
  equipment?: string[];
  level?: ExerciseLevel;
  muscles?: string[];
  category?: string;
  excludeHighImpact?: boolean;
  limit?: number;
};

const HIGH_IMPACT_CATEGORIES = new Set([
  "plyometrics",
  "olympic weightlifting",
  "strongman",
]);

export function getExerciseById(id: string): ExerciseRecord | undefined {
  return loadCatalog().find((exercise) => exercise.id === id);
}

export function searchExercises(
  filters: ExerciseSearchFilters = {},
): ExerciseRecord[] {
  const catalog = loadCatalog();
  const limit = filters.limit ?? 8;

  const results = catalog.filter((exercise) => {
    if (
      filters.equipment?.length &&
      !filters.equipment.includes(exercise.equipment ?? "none")
    ) {
      return false;
    }
    if (filters.level && exercise.level !== filters.level) return false;
    if (
      filters.muscles?.length &&
      !exercise.primaryMuscles.some((m) => filters.muscles?.includes(m))
    ) {
      return false;
    }
    if (filters.category && exercise.category !== filters.category) {
      return false;
    }
    if (
      filters.excludeHighImpact &&
      HIGH_IMPACT_CATEGORIES.has(exercise.category)
    ) {
      return false;
    }
    return true;
  });

  return results.slice(0, limit);
}
