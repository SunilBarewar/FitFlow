import sharp from "sharp";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src =
  process.argv[2] ??
  join(
    process.env.HOME ?? "",
    ".cursor/projects/Users-apple-Code-Workspace-fitflow/assets/image-b44c63d0-2954-4764-a654-86336cdd781a.png",
  );
const brandDir = join(root, "public/brand");

async function removeWhiteBackground(input) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(data);
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    if (a === 0) continue;
    // Near-white canvas around the green squircle
    if (r > 235 && g > 235 && b > 235) {
      pixels[i + 3] = 0;
    }
  }

  return sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  });
}

const mark512 = await (await removeWhiteBackground(src))
  .resize(512, 512, {
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();

const markPath = join(brandDir, "fitflow-mark.png");
const iconPath = join(brandDir, "fitflow-icon.png");
await sharp(mark512).toFile(markPath);
await sharp(mark512).resize(192, 192).toFile(iconPath);

console.log("Wrote", markPath, iconPath);
