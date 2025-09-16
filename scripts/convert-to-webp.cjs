// scripts/convert-to-webp.cjs (CommonJS)
const fs = require('fs');
const path = require('path');

async function main() {
  const sharp = require('sharp');
  const dir = path.resolve(__dirname, '..', 'public', 'cards');
  if (!fs.existsSync(dir)) {
    console.error('Directory not found:', dir);
    process.exit(1);
  }
  const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.png'));
  let converted = 0;
  for (const f of files) {
    const pngPath = path.join(dir, f);
    const webpPath = pngPath.replace(/\.png$/i, '.webp');
    if (fs.existsSync(webpPath)) continue;
    try {
      await require('sharp')(pngPath)
        .webp({ quality: 82, effort: 4 })
        .toFile(webpPath);
      converted++;
      console.log('Converted →', path.basename(webpPath));
    } catch (e) {
      console.error('Failed:', f, e.message);
    }
  }
  console.log(`Done. Converted: ${converted}/${files.length}`);
}

main().catch(e => { console.error(e); process.exit(1); });

