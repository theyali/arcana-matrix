// scripts/convert-img-to-webp.cjs
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', 'public', 'img');
const exts = new Set(['.png', '.jpg', '.jpeg']);
const concurrency = Number(process.env.WEBP_CONCURRENCY || 6);
const quality = Number(process.env.WEBP_QUALITY || 82);
const effort = Number(process.env.WEBP_EFFORT || 5);
const losslessPng = Boolean(process.env.WEBP_LOSSLESS); // 1 = lossless для PNG

async function main() {
  if (!fs.existsSync(ROOT)) {
    console.error('Directory not found:', ROOT);
    process.exit(1);
  }
  const sharp = require('sharp');

  const files = await collectFiles(ROOT);
  const inputs = files.filter(f => exts.has(path.extname(f).toLowerCase()));

  console.log(`Found ${inputs.length} images (png/jpg/jpeg) under ${ROOT}`);

  const stats = { converted: 0, skipped: 0, failed: 0 };
  await runQueue(inputs, concurrency, async (src) => {
    const ext = path.extname(src).toLowerCase();
    const dst = src.replace(/\.(png|jpe?g)$/i, '.webp');

    try {
      // Если webp уже есть и новее — пропускаем
      if (fs.existsSync(dst)) {
        const s1 = fs.statSync(src);
        const s2 = fs.statSync(dst);
        if (s2.mtimeMs >= s1.mtimeMs) {
          stats.skipped++;
          return;
        }
      }

      const pipeline = sharp(src).rotate(); // уважаем EXIF-ориентацию
      const opts = {
        quality,
        effort,
        alphaQuality: 90,
        // Для PNG можно включить lossless (по желанию через флаг)
        lossless: losslessPng && ext === '.png',
      };

      await pipeline.webp(opts).toFile(dst);
      stats.converted++;
      console.log('Converted →', path.relative(ROOT, dst));
    } catch (e) {
      stats.failed++;
      console.error('Failed:', path.relative(ROOT, src), '-', e.message);
    }
  });

  console.log(`Done. Converted: ${stats.converted}, Skipped: ${stats.skipped}, Failed: ${stats.failed}`);
}

async function collectFiles(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    const entries = fs.readdirSync(cur, { withFileTypes: true });
    for (const ent of entries) {
      const p = path.join(cur, ent.name);
      if (ent.isDirectory()) stack.push(p);
      else if (ent.isFile()) out.push(p);
    }
  }
  return out;
}

async function runQueue(items, limit, worker) {
  let i = 0;
  const runners = Array.from({ length: Math.max(1, limit) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await worker(items[idx]);
    }
  });
  await Promise.all(runners);
}

main().catch((e) => { console.error(e); process.exit(1); });
