import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Resvg } from '@resvg/resvg-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourceSvgPath = join(root, 'assets/brand/lulu-logo.svg');
const sourceSvg = readFileSync(sourceSvgPath, 'utf8');

const ADAPTIVE_ICON_SIZE = 1024;
const ADAPTIVE_SAFE_ZONE = 676;
const ADAPTIVE_OFFSET = (ADAPTIVE_ICON_SIZE - ADAPTIVE_SAFE_ZONE) / 2;

function extractSvgContent(svg) {
  return svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
}

function wrapInCanvas({ width, height, background, content, inset = 0, contentSize }) {
  const size = contentSize ?? width - inset * 2;
  const offset = inset || (width - size) / 2;
  const bg = background ? `<rect width="${width}" height="${height}" fill="${background}"/>` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
${bg}
<svg x="${offset}" y="${offset}" width="${size}" height="${size}" viewBox="0 0 150 150">
${content}
</svg>
</svg>`;
}

function toMonochromeContent(content, color = '#FFFFFF') {
  return content
    .replace(/<style[^>]*>[\s\S]*?<\/style>\s*/g, '')
    .replace(/<linearGradient[\s\S]*?<\/linearGradient>\s*/g, '')
    .replace(/class="cls-0"/g, `fill="${color}"`);
}

function renderPng(svg, width) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
  });
  const rendered = resvg.render();
  return { pngData: rendered.asPng(), width: rendered.width, height: rendered.height };
}

function writePng(file, svg, width) {
  mkdirSync(dirname(file), { recursive: true });
  const { pngData, width: renderedWidth, height: renderedHeight } = renderPng(svg, width);
  writeFileSync(file, pngData);
  console.log(`Wrote ${file.replace(`${root}/`, '')} (${renderedWidth}x${renderedHeight})`);
}

const logoContent = extractSvgContent(sourceSvg);

const outputs = [
  {
    file: join(root, 'assets/brand/lulu-logo.png'),
    svg: sourceSvg,
    width: 260,
  },
  {
    file: join(root, 'assets/brand/lulu-logo@2x.png'),
    svg: sourceSvg,
    width: 520,
  },
  {
    file: join(root, 'assets/brand/lulu-logo@3x.png'),
    svg: sourceSvg,
    width: 780,
  },
  {
    file: join(root, 'assets/images/lulu-logo.png'),
    svg: sourceSvg,
    width: 1024,
  },
  {
    file: join(root, 'assets/images/icon.png'),
    svg: wrapInCanvas({
      width: ADAPTIVE_ICON_SIZE,
      height: ADAPTIVE_ICON_SIZE,
      background: '#000000',
      content: logoContent,
      contentSize: ADAPTIVE_SAFE_ZONE,
    }),
    width: ADAPTIVE_ICON_SIZE,
  },
  {
    file: join(root, 'assets/images/android-icon-foreground.png'),
    svg: wrapInCanvas({
      width: ADAPTIVE_ICON_SIZE,
      height: ADAPTIVE_ICON_SIZE,
      content: logoContent,
      contentSize: ADAPTIVE_SAFE_ZONE,
    }),
    width: ADAPTIVE_ICON_SIZE,
  },
  {
    file: join(root, 'assets/images/android-icon-monochrome.png'),
    svg: wrapInCanvas({
      width: ADAPTIVE_ICON_SIZE,
      height: ADAPTIVE_ICON_SIZE,
      content: toMonochromeContent(logoContent),
      contentSize: ADAPTIVE_SAFE_ZONE,
    }),
    width: ADAPTIVE_ICON_SIZE,
  },
  {
    file: join(root, 'assets/images/favicon.png'),
    svg: wrapInCanvas({
      width: 48,
      height: 48,
      background: '#000000',
      content: logoContent,
      contentSize: 32,
    }),
    width: 48,
  },
];

for (const { file, svg, width } of outputs) {
  writePng(file, svg, width);
}
