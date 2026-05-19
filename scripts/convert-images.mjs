// One-shot: walk /public/images, convert every .png to .webp, delete the .png.
// Photo folders get lossy q=82; logos keep alpha at q=92 with lossless for small files.
import { readdirSync, statSync, unlinkSync } from 'node:fs';
import { join, extname, basename, dirname } from 'node:path';
import sharp from 'sharp';

const ROOT = new URL('../public/images/', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');

const LOSSLESS_FOLDERS = new Set(['agencies']); // logos: keep crisp + transparent

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const s = statSync(full);
    if (s.isDirectory()) out.push(...walk(full));
    else if (extname(name).toLowerCase() === '.png') out.push(full);
  }
  return out;
}

const files = walk(ROOT);
console.log(`Converting ${files.length} PNGs to WebP...\n`);

for (const file of files) {
  const folder = basename(dirname(file));
  const out = file.replace(/\.png$/i, '.webp');
  const lossless = LOSSLESS_FOLDERS.has(folder);

  const before = statSync(file).size;
  await sharp(file)
    .webp(lossless ? { lossless: true, effort: 6 } : { quality: 82, effort: 5 })
    .toFile(out);
  const after = statSync(out).size;
  unlinkSync(file);
  const pct = Math.round((1 - after / before) * 100);
  console.log(
    `${folder.padEnd(10)} ${basename(file).padEnd(20)} ${(before / 1024).toFixed(0).padStart(6)} KB → ${(after / 1024).toFixed(0).padStart(6)} KB  (-${pct}%)`,
  );
}

console.log('\nDone.');
