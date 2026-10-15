import sharp from 'sharp';
import {mkdir, readdir, stat} from 'node:fs/promises';
import path from 'node:path';

// Keep original artwork outside public; only web-sized derivatives are deployed.
let originalBytes = 0;
let outputBytes = 0;
for (const directory of ['sparklin', 'assets', 'icons', 'patterns']) {
  await mkdir(`public/${directory}`, {recursive:true});
  for (const filename of await readdir(`assets/images/${directory}`)) {
    if (!filename.endsWith('.png')) continue;
    const source = `assets/images/${directory}/${filename}`;
    originalBytes += (await stat(source)).size;
    const iconSize = filename === 'icon-192x192.png' ? 192 : filename === 'icon-512x512.png' ? 512 : undefined;
    const output = `public/${directory}/${iconSize ? filename : filename.replace('.png','.webp')}`;
    const image = sharp(source).resize({width:iconSize ?? (directory === 'assets' ? 500 : 512),withoutEnlargement:true});
    if (iconSize) await image.png({compressionLevel:9, palette:true}).toFile(output);
    else await image.webp({quality:85,effort:6,alphaQuality:100}).toFile(output);
    outputBytes += (await stat(output)).size;
    console.log(`${path.basename(output)}: ${(await stat(output)).size} bytes`);
  }
}
await sharp('assets/images/sparklin/sparklin_talking.png').resize(128,128).webp({quality:85,effort:6,alphaQuality:100}).toFile('public/sparklin/sparklin-avatar.webp');
outputBytes += (await stat('public/sparklin/sparklin-avatar.webp')).size;
console.log(`Total: ${originalBytes} → ${outputBytes} bytes (${(100*(1-outputBytes/originalBytes)).toFixed(1)}% smaller)`);
