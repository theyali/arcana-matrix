// scripts/make-thumbs.cjs
const fs = require('fs'); const p = require('path'); const sharp = require('sharp');
const SRC = p.resolve(__dirname, '..', 'public/img/cards');
const DST = p.join(SRC, 'thumbs');
fs.mkdirSync(DST, { recursive: true });
for (const f of fs.readdirSync(SRC)) {
  if (!/\.webp$/i.test(f)) continue;
  const src = p.join(SRC, f), dst = p.join(DST, f);
  if (fs.existsSync(dst)) continue;
  sharp(src).resize({ width: 175, withoutEnlargement: true }).webp({ quality: 80, effort: 5 }).toFile(dst)
    .then(() => console.log('thumb →', f))
    .catch(e => console.error('fail', f, e.message));
}
