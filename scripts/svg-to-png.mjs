import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const svgPath = resolve(root, "public", "og-image.svg");
const pngPath = resolve(root, "public", "og-image.png");

const svgBuffer = readFileSync(svgPath);

await sharp(svgBuffer)
  .resize(1200, 630)
  .png()
  .toFile(pngPath);

console.log(`✅ Converted og-image.svg → og-image.png (1200×630)`);
console.log(`   Size: ${(readFileSync(pngPath).length / 1024).toFixed(1)} KB`);
