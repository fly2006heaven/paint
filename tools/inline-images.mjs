/* ============================================================================
   inline-images.mjs —— 把 img/ 目录里的作品图转成 base64 内联进 index.html
   ----------------------------------------------------------------------------
   用法（在 C:\source\paint 目录下）：
     node tools/inline-images.mjs            # 生成/更新内联数据
     node tools/inline-images.mjs --check    # 只检查图片是否齐全，不改文件
     node tools/inline-images.mjs --clear    # 清空已内联的数据，回到 SVG 占位

   命名约定（扩展名会自动识别 jpg/jpeg/png/webp/avif/gif）：
     img/xuyoudian-1.jpg  img/xuyoudian-2.jpg  img/xuyoudian-3.jpg
     img/dino-1.jpg       img/dino-2.jpg       img/dino-3.jpg
     img/miyama-1.jpg     img/miyama-2.jpg     img/miyama-3.jpg
     img/avatar-xuyoudian.jpg / avatar-dino.jpg / avatar-miyama.jpg
   ============================================================================ */
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const HTML_PATH = join(ROOT, 'index.html');
const IMG_DIR = join(ROOT, 'img');
const EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'];
const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif' };

const ARTISTS = [
  { id: 'xuyoudian', name: '徐尤点' },
  { id: 'dino', name: 'Dino' },
  { id: 'miyama', name: '米山舞' }
];
const SLOTS = ARTISTS.flatMap((a) => [
  { slot: `bg-${a.id}`, label: `${a.name} 轮播背景图 ★` },
  { slot: `${a.id}-1`, label: `${a.name} 作品 1` },
  { slot: `${a.id}-2`, label: `${a.name} 作品 2` },
  { slot: `${a.id}-3`, label: `${a.name} 作品 3` },
  { slot: `avatar-${a.id}`, label: `${a.name} 头像` }
]);

/** 在 img/ 里找 <slot>.<任意支持的扩展名> */
function findImage(slot) {
  for (const ext of EXTS) {
    const file = join(IMG_DIR, slot + ext);
    if (existsSync(file) && statSync(file).isFile()) return { file, ext };
  }
  return null;
}

function main() {
  const mode = process.argv.includes('--check') ? 'check' : process.argv.includes('--clear') ? 'clear' : 'inline';
  const html = readFileSync(HTML_PATH, 'utf8');
  const marker = /\/\* INLINE-IMAGES-START \*\/[\s\S]*?\/\* INLINE-IMAGES-END \*\//;
  if (!marker.test(html)) {
    console.error('✗ 在 index.html 里找不到 INLINE-IMAGES 标记，无法写入。');
    process.exit(1);
  }

  if (mode === 'clear') {
    writeFileSync(HTML_PATH, html.replace(marker, '/* INLINE-IMAGES-START */ {} /* INLINE-IMAGES-END */'));
    console.log('✓ 已清空内联图片，页面回到 SVG 占位插画。');
    return;
  }

  if (!existsSync(IMG_DIR)) {
    console.log(`✗ 还没有图片目录：${IMG_DIR}`);
    console.log('  先新建 img/ 目录，把作品图按下面的名字放进去，再运行本脚本。\n');
  }

  const map = {};
  let found = 0;
  let bytes = 0;
  const lines = [];

  for (const { slot, label } of SLOTS) {
    const hit = findImage(slot);
    if (hit) {
      const buf = readFileSync(hit.file);
      map[slot] = `data:${MIME[hit.ext]};base64,${buf.toString('base64')}`;
      found++;
      bytes += buf.length;
      lines.push(`  ✓ ${slot.padEnd(20)} ${hit.ext.padEnd(6)} ${(buf.length / 1024).toFixed(0)} KB   ${label}`);
    } else {
      lines.push(`  ✗ ${slot.padEnd(20)} ${''.padEnd(6)} ${''.padEnd(8)}   ${label} —— 缺失，该位置继续用 SVG 占位`);
    }
  }

  console.log(`图片检查（目录：${IMG_DIR}）\n${lines.join('\n')}\n`);
  console.log(`找到 ${found}/${SLOTS.length} 张，合计 ${(bytes / 1024 / 1024).toFixed(2)} MB 原图。`);

  if (mode === 'check') {
    console.log('\n（--check 模式：未修改 index.html）');
    return;
  }
  if (found === 0) {
    console.log('\n没有可用图片，index.html 保持不变。');
    return;
  }

  const out = html.replace(marker, `/* INLINE-IMAGES-START */ ${JSON.stringify(map)} /* INLINE-IMAGES-END */`);
  writeFileSync(HTML_PATH, out);
  const size = statSync(HTML_PATH).size;
  console.log(`\n✓ 已写入 index.html：${found} 张图片内联为 base64，文件体积 ${(size / 1024 / 1024).toFixed(2)} MB。`);
  console.log('  依然是单文件、零外链、零 404，双击即可打开。');
  if (found < SLOTS.length) {
    console.log(`  提示：还有 ${SLOTS.length - found} 个位置用 SVG 占位，补齐图片后再跑一次即可。`);
  }
}

main();
