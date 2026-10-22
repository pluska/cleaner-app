import sharp from 'sharp';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const SOURCE_IMAGE = path.join(ROOT_DIR, 'public/icons/favicon.jpeg');

// Helper to encode multi-size PNGs into a standard Windows/Web ICO format
function createIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = ICO type
  header.writeUInt16LE(images.length, 4); // count of images

  let offset = 6 + images.length * 16;
  const entries = [];
  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bit depth
    entry.writeUInt32LE(img.buffer.length, 8); // size of PNG buffer
    entry.writeUInt32LE(offset, 12); // offset in file
    entries.push(entry);
    offset += img.buffer.length;
  }
  return Buffer.concat([header, ...entries, ...images.map((img) => img.buffer)]);
}

async function extractTransparentBadge() {
  console.log('Loading source image:', SOURCE_IMAGE);
  const { data, info } = await sharp(SOURCE_IMAGE)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const visited = new Uint8Array(width * height);
  const queue = [];

  function tryEnqueue(idx) {
    if (visited[idx]) return;
    const p = idx * channels;
    const r = data[p], g = data[p + 1], b = data[p + 2];
    const dist = Math.hypot(r - 69, g - 69, b - 69);
    // Dark neutral grey background or drop shadow cast on it
    const isNeutral = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b)) < 12;
    if (dist < 22 || (isNeutral && r < 80 && g < 80 && b < 80)) {
      visited[idx] = 1;
      queue.push(idx);
    }
  }

  // Seed with all border pixels
  for (let x = 0; x < width; x++) {
    tryEnqueue(x);
    tryEnqueue((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    tryEnqueue(y * width);
    tryEnqueue(y * width + (width - 1));
  }

  let head = 0;
  while (head < queue.length) {
    const curr = queue[head++];
    const cx = curr % width;
    const cy = Math.floor(curr / width);

    const neighbors = [
      cx > 0 ? curr - 1 : -1,
      cx < width - 1 ? curr + 1 : -1,
      cy > 0 ? curr - width : -1,
      cy < height - 1 ? curr + width : -1,
    ];

    for (const n of neighbors) {
      if (n !== -1 && !visited[n]) {
        const p = n * channels;
        const r = data[p], g = data[p + 1], b = data[p + 2];
        const dist = Math.hypot(r - 69, g - 69, b - 69);
        const isNeutral = Math.max(Math.abs(r - g), Math.abs(r - b), Math.abs(g - b)) < 12;
        if (dist < 22 || (isNeutral && r < 80 && g < 80 && b < 80)) {
          visited[n] = 1;
          queue.push(n);
        }
      }
    }
  }

  // Assemble RGBA buffer with transparent background
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const p = i * channels;
    const dst = i * 4;
    rgba[dst] = data[p];
    rgba[dst + 1] = data[p + 1];
    rgba[dst + 2] = data[p + 2];
    rgba[dst + 3] = visited[i] ? 0 : 255;
  }

  const masterPng = await sharp(rgba, { raw: { width, height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toBuffer();

  await fs.writeFile(path.join(ROOT_DIR, 'public/icons/wizard-master.png'), masterPng);
  console.log('✓ Created master transparent wizard badge: public/icons/wizard-master.png');

  return masterPng;
}

async function generateFavicons(masterBadge) {
  console.log('Generating favicons and application icons...');

  // 1. Favicon PNGs (16x16, 32x32, 48x48)
  const icoSizes = [16, 32, 48];
  const icoImages = [];

  for (const size of icoSizes) {
    const pngBuf = await sharp(masterBadge)
      .resize(size, size, { kernel: sharp.kernel.lanczos3 })
      .sharpen({ sigma: 0.6, m1: 0.5, m2: 2 })
      .png({ compressionLevel: 9 })
      .toBuffer();

    const dest = path.join(ROOT_DIR, `public/icons/favicon-${size}x${size}.png`);
    await fs.writeFile(dest, pngBuf);
    icoImages.push({ width: size, height: size, buffer: pngBuf });
    console.log(`✓ Generated ${dest}`);
  }

  // 2. Multi-resolution favicon.ico (16, 32, 48)
  const icoBuffer = createIco(icoImages);
  // Next's App Router owns /favicon.ico; a public duplicate causes a route conflict.
  await fs.rm(path.join(ROOT_DIR, 'public/favicon.ico'), { force: true });
  await fs.writeFile(path.join(ROOT_DIR, 'src/app/favicon.ico'), icoBuffer);
  console.log('✓ Generated src/app/favicon.ico (canonical /favicon.ico route)');

  // 3. Apple Touch Icon (180x180) - Solid midnight background to avoid iOS black corner rendering
  const appleTouchSize = 180;
  const appleWizard = await sharp(masterBadge)
    .resize(176, 176, { fit: 'contain' })
    .toBuffer();

  const appleBgSvg = Buffer.from(`
    <svg width="${appleTouchSize}" height="${appleTouchSize}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="appleBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#080e22" />
          <stop offset="100%" stop-color="#111e42" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#appleBg)" />
    </svg>
  `);

  const appleTouchPng = await sharp(appleBgSvg)
    .composite([{ input: appleWizard, top: 2, left: 2 }])
    .png({ compressionLevel: 9 })
    .toBuffer();

  await fs.writeFile(path.join(ROOT_DIR, 'public/apple-touch-icon.png'), appleTouchPng);
  await fs.writeFile(path.join(ROOT_DIR, 'public/icons/apple-touch-icon.png'), appleTouchPng);
  await fs.writeFile(path.join(ROOT_DIR, 'src/app/apple-icon.png'), appleTouchPng);
  console.log('✓ Generated apple-touch-icon.png in public/ and src/app/apple-icon.png');

  // 4. PWA and Web App Icons (192x192, 512x512)
  for (const size of [192, 512]) {
    const png = await sharp(masterBadge)
      .resize(size, size, { kernel: sharp.kernel.lanczos3 })
      .png({ compressionLevel: 9 })
      .toBuffer();

    await fs.writeFile(path.join(ROOT_DIR, `public/icons/icon-${size}x${size}.png`), png);
    await fs.writeFile(path.join(ROOT_DIR, `assets/images/icons/icon-${size}x${size}.png`), png);
    if (size === 512) {
      await fs.writeFile(path.join(ROOT_DIR, 'src/app/icon.png'), png);
    }
    console.log(`✓ Generated icon-${size}x${size}.png in public/icons/ and assets/images/icons/`);
  }
}

async function generateSocialShareImages(masterBadge) {
  console.log('Generating social share preview images (Open Graph & Twitter)...');

  // 1. Open Graph 1200x630 banner
  const width = 1200;
  const height = 630;
  const wizardSize = 510;

  const wizardBuf = await sharp(masterBadge)
    .resize(wizardSize, wizardSize, { kernel: sharp.kernel.lanczos3 })
    .toBuffer();

  const ogSvg = Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#080d1e" />
          <stop offset="50%" stop-color="#0f1d3d" />
          <stop offset="100%" stop-color="#182a5c" />
        </linearGradient>

        <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#bae6fd" />
        </linearGradient>

        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="50%" stop-color="#fde047" />
          <stop offset="100%" stop-color="#f59e0b" />
        </linearGradient>

        <linearGradient id="cyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#38bdf8" />
          <stop offset="100%" stop-color="#818cf8" />
        </linearGradient>

        <radialGradient id="wizardGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.35" />
          <stop offset="60%" stop-color="#2563eb" stop-opacity="0.15" />
          <stop offset="100%" stop-color="#1e1b4b" stop-opacity="0" />
        </radialGradient>

        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#000000" flood-opacity="0.55" />
        </filter>
      </defs>

      <!-- Background Gradient -->
      <rect width="100%" height="100%" fill="url(#bgGrad)" />

      <!-- Subtle Grid Pattern -->
      <g stroke="rgba(255, 255, 255, 0.04)" stroke-width="1">
        <line x1="0" y1="105" x2="1200" y2="105" />
        <line x1="0" y1="210" x2="1200" y2="210" />
        <line x1="0" y1="315" x2="1200" y2="315" />
        <line x1="0" y1="420" x2="1200" y2="420" />
        <line x1="0" y1="525" x2="1200" y2="525" />
        <line x1="200" y1="0" x2="200" y2="630" />
        <line x1="400" y1="0" x2="400" y2="630" />
        <line x1="600" y1="0" x2="600" y2="630" />
        <line x1="800" y1="0" x2="800" y2="630" />
        <line x1="1000" y1="0" x2="1000" y2="630" />
      </g>

      <!-- Magical Aura behind Wizard -->
      <circle cx="905" cy="315" r="320" fill="url(#wizardGlow)" />

      <!-- Decorative Sparkle Stars -->
      <g fill="#38bdf8" opacity="0.8">
        <path d="M110 90 L115 105 L130 110 L115 115 L110 130 L105 115 L90 110 L105 105 Z" />
        <path d="M580 80 L583 90 L593 93 L583 96 L580 106 L577 96 L567 93 L577 90 Z" />
        <path d="M620 520 L624 533 L637 537 L624 541 L620 554 L616 541 L603 537 L616 533 Z" />
        <path d="M1130 180 L1133 190 L1143 193 L1133 196 L1130 206 L1127 196 L1117 193 L1127 190 Z" />
        <path d="M1150 480 L1153 490 L1163 493 L1153 496 L1150 506 L1147 496 L1137 493 L1147 490 Z" />
      </g>
      <g fill="#fde047" opacity="0.75">
        <path d="M510 200 L513 210 L523 213 L513 216 L510 226 L507 216 L497 213 L507 210 Z" />
        <path d="M80 500 L84 512 L96 516 L84 520 L80 532 L76 520 L64 516 L76 512 Z" />
      </g>

      <!-- Left Column Content -->
      <!-- Category Badge -->
      <rect x="80" y="75" width="280" height="38" rx="19" fill="rgba(56, 189, 248, 0.12)" stroke="rgba(56, 189, 248, 0.4)" stroke-width="1.5" />
      <text x="100" y="99" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#38bdf8" letter-spacing="1.5">✨ GAMIFIED HOME PLANNER</text>

      <!-- App Title -->
      <text x="80" y="190" font-family="system-ui, -apple-system, sans-serif" font-size="68" font-weight="900" fill="url(#textGrad)" letter-spacing="-1">SparkClean</text>

      <!-- Headline -->
      <text x="80" y="252" font-family="system-ui, -apple-system, sans-serif" font-size="32" font-weight="700" fill="url(#goldGrad)">Turn Cleaning Into an RPG Quest</text>

      <!-- Description / Tagline -->
      <text x="80" y="305" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="400" fill="#94a3b8">
        Stop procrastinating. Turn daily chores into rewarding quests,
      </text>
      <text x="80" y="335" font-family="system-ui, -apple-system, sans-serif" font-size="19" font-weight="400" fill="#94a3b8">
        earn XP, defeat clutter bosses, and level up your kingdom.
      </text>

      <!-- Feature Badges -->
      <g transform="translate(80, 380)">
        <g transform="translate(0, 0)">
          <rect width="155" height="44" rx="12" fill="rgba(255, 255, 255, 0.06)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1" />
          <text x="16" y="27" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="600" fill="#e2e8f0">⚔️ Daily Quests</text>
        </g>
        <g transform="translate(167, 0)">
          <rect width="170" height="44" rx="12" fill="rgba(255, 255, 255, 0.06)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1" />
          <text x="16" y="27" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="600" fill="#e2e8f0">🏆 Earn XP &amp; Levels</text>
        </g>
        <g transform="translate(349, 0)">
          <rect width="160" height="44" rx="12" fill="rgba(255, 255, 255, 0.06)" stroke="rgba(255, 255, 255, 0.12)" stroke-width="1" />
          <text x="16" y="27" font-family="system-ui, -apple-system, sans-serif" font-size="15" font-weight="600" fill="#e2e8f0">🏰 Build Kingdom</text>
        </g>
      </g>

      <!-- Bottom Status Button -->
      <g transform="translate(80, 475)">
        <rect width="240" height="48" rx="24" fill="url(#cyanGrad)" filter="url(#shadow)" />
        <text x="32" y="30" font-family="system-ui, -apple-system, sans-serif" font-size="17" font-weight="800" fill="#ffffff" letter-spacing="0.5">START YOUR QUEST →</text>
      </g>

      <!-- Outer Border / Subtle Glow Frame -->
      <rect x="1.5" y="1.5" width="1197" height="627" rx="0" fill="none" stroke="rgba(56, 189, 248, 0.25)" stroke-width="3" />
    </svg>
  `);

  const ogBuffer = await sharp(ogSvg)
    .composite([
      {
        input: wizardBuf,
        top: 60,
        left: 650,
      },
    ])
    .png({ quality: 95 })
    .toBuffer();

  await fs.writeFile(path.join(ROOT_DIR, 'public/og-image.png'), ogBuffer);
  await fs.writeFile(path.join(ROOT_DIR, 'src/app/opengraph-image.png'), ogBuffer);
  await fs.writeFile(path.join(ROOT_DIR, 'src/app/twitter-image.png'), ogBuffer);
  console.log('✓ Generated public/og-image.png, src/app/opengraph-image.png, and src/app/twitter-image.png');

  // 2. Square 1200x1200 image for WhatsApp, Telegram, and square preview cards
  const sqSize = 1200;
  const sqWizardSize = 650;
  const sqWizardBuf = await sharp(masterBadge)
    .resize(sqWizardSize, sqWizardSize, { kernel: sharp.kernel.lanczos3 })
    .toBuffer();

  const sqSvg = Buffer.from(`
    <svg width="${sqSize}" height="${sqSize}" viewBox="0 0 ${sqSize} ${sqSize}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sqBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#080d1e" />
          <stop offset="50%" stop-color="#0f1d3d" />
          <stop offset="100%" stop-color="#182a5c" />
        </linearGradient>

        <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="#bae6fd" />
        </linearGradient>

        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#fef08a" />
          <stop offset="50%" stop-color="#fde047" />
          <stop offset="100%" stop-color="#f59e0b" />
        </linearGradient>

        <radialGradient id="sqGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.35" />
          <stop offset="60%" stop-color="#2563eb" stop-opacity="0.15" />
          <stop offset="100%" stop-color="#1e1b4b" stop-opacity="0" />
        </radialGradient>
      </defs>

      <rect width="100%" height="100%" fill="url(#sqBg)" />

      <!-- Center Glow -->
      <circle cx="600" cy="580" r="420" fill="url(#sqGlow)" />

      <!-- Top Branding -->
      <rect x="460" y="80" width="280" height="38" rx="19" fill="rgba(56, 189, 248, 0.12)" stroke="rgba(56, 189, 248, 0.4)" stroke-width="1.5" />
      <text x="600" y="104" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#38bdf8" letter-spacing="1.5" text-anchor="middle">✨ GAMIFIED HOME PLANNER</text>

      <text x="600" y="185" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="900" fill="url(#textGrad)" letter-spacing="-1" text-anchor="middle">SparkClean</text>

      <text x="600" y="235" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="700" fill="url(#goldGrad)" text-anchor="middle">Turn Cleaning Into an RPG Quest</text>

      <!-- Bottom Tagline & Features -->
      <text x="600" y="990" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="500" fill="#cbd5e1" text-anchor="middle">⚔️ Daily Quests  •  🏆 Earn XP &amp; Levels  •  🏰 Build Kingdom</text>
      <text x="600" y="1040" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="400" fill="#64748b" text-anchor="middle">sparkclean.app • Turn your chores into an RPG adventure</text>

      <!-- Frame Border -->
      <rect x="2" y="2" width="1196" height="1196" rx="0" fill="none" stroke="rgba(56, 189, 248, 0.25)" stroke-width="4" />
    </svg>
  `);

  const sqOgBuffer = await sharp(sqSvg)
    .composite([
      {
        input: sqWizardBuf,
        top: 275,
        left: Math.round((1200 - sqWizardSize) / 2),
      },
    ])
    .png({ quality: 95 })
    .toBuffer();

  await fs.writeFile(path.join(ROOT_DIR, 'public/og-image-square.png'), sqOgBuffer);
  console.log('✓ Generated public/og-image-square.png');
}

async function main() {
  console.log('--- Generating SparkClean Icons & Social Share Preview ---');
  const masterBadge = await extractTransparentBadge();
  await generateFavicons(masterBadge);
  await generateSocialShareImages(masterBadge);
  console.log('--- All assets generated successfully! ---');
}

main().catch((err) => {
  console.error('Generation failed:', err);
  process.exit(1);
});
