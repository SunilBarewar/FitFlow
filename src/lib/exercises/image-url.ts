const EXERCISE_IMAGE_BASE_URL = "https://ik.imagekit.io/yuhonas";

/** Builds a full CDN URL from a catalog-relative image path (e.g. "3_4_Sit-Up/0.jpg"). */
export function exerciseImageUrl(relativePath: string): string {
  return `${EXERCISE_IMAGE_BASE_URL}/${relativePath}`;
}
