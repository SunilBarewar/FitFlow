"use client";

import Image from "next/image";
import { KitMark } from "@/features/chat/components/ui/glyphs";
import type { Exercise } from "@/features/chat/types";
import { exerciseImageUrl } from "@/lib/exercises/image-url";
import { cn } from "@/lib/utils/cn";

export function ExerciseThumbnail({
  exercise,
  size = 52,
  dimmed = false,
}: {
  exercise: Pick<Exercise, "images">;
  size?: number;
  dimmed?: boolean;
}) {
  const image = exercise.images?.[0];
  const style = { height: size, width: size };

  if (!image) {
    return (
      <div
        style={style}
        className="flex shrink-0 items-center justify-center rounded-xl bg-sunken"
      >
        <KitMark id="dumbbell" size={22} className="text-line-strong" />
      </div>
    );
  }

  return (
    <div
      style={style}
      className="relative shrink-0 overflow-hidden rounded-xl bg-sunken"
    >
      <Image
        src={exerciseImageUrl(image)}
        alt=""
        fill
        sizes={`${size}px`}
        className={cn("object-cover", dimmed && "opacity-60")}
      />
    </div>
  );
}
