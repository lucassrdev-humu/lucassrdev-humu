import { MONO, document, esc, monoWidth, round, delay, mix } from '../lib.mjs';

const W = 1200;
const PAD = 28;
const LABEL_W = 210;
const CHIP_H = 38;
const ROW_GAP = 12;
const CHIP_GAP = 10;

export function stack(cfg, icons, t) {
  const { p, a, dark } = t;
  const fill = dark ? mix(p.base, p.mantle, 0.5) : p.mantle;
  const chipFill = dark ? p.surface0 : p.base;
  const right = W - PAD;
  let y = PAD;
  let index = 0;
  const rows = [];

  cfg.stack.forEach((group, g) => {
    const color = a[g % a.length];
    rows.push(`<g class="rise" style="${delay(g * 0.12)}">
<rect x="${PAD}" y="${y + 15}" width="8" height="8" rx="2" fill="${color}"/>
<text x="${PAD + 18}" y="${y + 23}" font-size="13" letter-spacing="1" fill="${p.subtext0}">${esc(group.label.toUpperCase())}</text>
</g>`);
    let x = PAD + LABEL_W;
    for (const item of group.items) {
      const icon = item.icon ? icons[item.icon] : null;
      const textX = icon ? 42 : 30;
      const width = textX + monoWidth(item.name, 14) + 16;
      if (x + width > right) {
        x = PAD + LABEL_W;
        y += CHIP_H + ROW_GAP;
      }
      const glyph = icon
        ? `<path d="${icon}" transform="translate(${round(x + 14)} ${y + 10}) scale(.75)" fill="${p.subtext1}"/>`
        : `<circle cx="${round(x + 17)}" cy="${y + CHIP_H / 2}" r="4" fill="${color}"/>`;
      rows.push(`<g class="pop" style="${delay(0.25 + index * 0.035)}">
<rect x="${round(x)}" y="${y}" width="${round(width)}" height="${CHIP_H}" rx="10" fill="${chipFill}" stroke="${mix(chipFill, color, 0.35)}"/>
${glyph}
<text x="${round(x + textX)}" y="${y + 24}" font-size="14" fill="${p.text}">${esc(item.name)}</text>
</g>`);
      x += width + CHIP_GAP;
      index++;
    }
    y += CHIP_H + ROW_GAP + 8;
  });

  const H = y + PAD - ROW_GAP - 8;
  const body = `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="18" fill="${fill}" stroke="${p.surface0}"/>
<g font-family="${MONO}">${rows.join('\n')}</g>`;

  return document({
    width: W,
    height: H,
    title: 'Stack',
    desc: cfg.stack.map((g) => `${g.label}: ${g.items.map((i) => i.name).join(', ')}`).join('. '),
    body,
  });
}
