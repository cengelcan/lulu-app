import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Resvg } from '@resvg/resvg-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourceSvg = join(root, 'assets/brand/lulu-logo.svg');

const outputs = [
  { file: join(root, 'assets/brand/lulu-logo.png'), width: 260 },
  { file: join(root, 'assets/brand/lulu-logo@2x.png'), width: 520 },
  { file: join(root, 'assets/brand/lulu-logo@3x.png'), width: 780 },
  { file: join(root, 'assets/images/lulu-logo.png'), width: 1024 },
];

const svg = readFileSync(sourceSvg, 'utf8');

for (const { file, width } of outputs) {
  mkdirSync(dirname(file), { recursive: true });

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
  });
  const rendered = resvg.render();
  const pngData = rendered.asPng();

  writeFileSync(file, pngData);
  console.log(`Wrote ${file.replace(`${root}/`, '')} (${rendered.width}x${rendered.height})`);
}
