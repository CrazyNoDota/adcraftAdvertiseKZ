// Re-compress agency logos to lossy WebP (alpha preserved). Run after the
// initial convert if the logos came in as huge PNGs from an AI model.
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import sharp from 'sharp';

const DIR = new URL('../public/images/agencies/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

const files = readdirSync(DIR).filter((f) => f.endsWith('.webp'));
console.log(`Optimizing ${files.length} logos...\n`);

for (const file of files) {
  const src = join(DIR, file);
  const before = statSync(src).size;
  // Read into memory first so sharp doesn't keep a file handle on Windows.
  const buf = readFileSync(src);
  const out = await sharp(buf)
    .resize({ width: 640, withoutEnlargement: true })
    .webp({ quality: 80, alphaQuality: 90, effort: 6 })
    .toBuffer();
  writeFileSync(src, out);
  const after = statSync(src).size;
  const pct = Math.round((1 - after / before) * 100);
  console.log(`${basename(file).padEnd(22)} ${(before / 1024).toFixed(0).padStart(6)} KB → ${(after / 1024).toFixed(0).padStart(5)} KB  (-${pct}%)`);
}
console.log('\nDone.');
