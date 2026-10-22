import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';

// Keep the original Figma artwork intact; ship proportional, transparent WebP copies.
await mkdir('public/kingdom', { recursive: true });
for (const name of ['terrain', 'tower1', 'tower2', 'tower3', 'tavern3d', 'well3d', 'gate3d', 'sparklin']) {
  const size = name === 'terrain' ? 1536 : name === 'sparklin' ? 192 : 512;
  const output = `public/kingdom/${name}.webp`;
  await sharp(`design/sparkclean/assets/${name}.png`)
    .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 88, alphaQuality: 100, effort: 6 })
    .toFile(output);
  console.log(`${output}: ${(await stat(output)).size} bytes`);
}
