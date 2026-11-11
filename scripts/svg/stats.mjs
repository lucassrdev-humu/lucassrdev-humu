import { MONO, SANS, document, esc, formatNumber, round, delay, mix } from '../lib.mjs';

const W = 1200;
const H = 156;
const GAP = 20;
const DIGIT_H = 50;
const DIGIT_W = 27;
const DIGIT_SIZE = 44;

function odometer(value, x, y, color, start, id) {
  const text = formatNumber(value);
  let cursor = x;
  const parts = [];
  [...text].forEach((ch, i) => {
    if (!/\d/.test(ch)) {
      parts.push(`<text x="${round(cursor + 6)}" y="${DIGIT_H - 12}" text-anchor="middle" fill="${color}">${esc(ch)}</text>`);
      cursor += 12;
      return;
    }
    const target = 10 + Number(ch);
    const strip = Array.from({ length: 20 }, (_, n) => `<text x="${round(cursor + DIGIT_W / 2)}" y="${n * DIGIT_H + DIGIT_H - 12}" text-anchor="middle">${n % 10}</text>`).join('');
    parts.push(`<g style="transform:translateY(${-target * DIGIT_H}px);animation:roll${target} ${round(1.5 + i * 0.12)}s cubic-bezier(.15,.85,.25,1) ${round(start + i * 0.06)}s both">${strip}</g>`);
    cursor += DIGIT_W;
  });
  return {
    width: cursor - x,
    svg: `<clipPath id="clip${id}"><rect x="${x - 4}" y="${y}" width="${round(cursor - x + 8)}" height="${DIGIT_H}"/></clipPath>
<g clip-path="url(#clip${id})"><g transform="translate(0 ${y})" fill="${color}" font-family="${MONO}" font-size="${DIGIT_SIZE}" font-weight="700">${parts.join('')}</g></g>`,
  };
}

export function stats(cfg, data, t) {
  const { p, a, dark } = t;
  const s = data.stats;
  const tiles = [
    { label: 'contribuições', value: s.total, unit: '12 meses' },
    { label: 'dias ativos', value: s.active, unit: `de ${data.days.length}` },
    { label: 'maior sequência', value: s.longest, unit: s.longest === 1 ? 'dia' : 'dias' },
    { label: 'sequência atual', value: s.current, unit: s.current === 1 ? 'dia' : 'dias' },
  ];
  const tileW = (W - GAP * (tiles.length - 1)) / tiles.length;
  const fill = dark ? mix(p.base, p.mantle, 0.5) : p.mantle;

  const body = tiles
    .map((tile, i) => {
      const x = i * (tileW + GAP);
      const color = a[i % a.length];
      const start = 0.25 + i * 0.15;
      const num = odometer(tile.value, x + 26, 58, p.text, start, i);
      return `<g class="rise" style="${delay(i * 0.1)}">
<rect x="${round(x + 0.5)}" y=".5" width="${round(tileW - 1)}" height="${H - 1}" rx="18" fill="${fill}" stroke="${p.surface0}"/>
<rect x="${round(x + 26)}" y="28" width="8" height="8" rx="2" fill="${color}"/>
<text x="${round(x + 44)}" y="36" font-family="${MONO}" font-size="13" letter-spacing="1" fill="${p.subtext0}">${esc(tile.label.toUpperCase())}</text>
${num.svg}
<text x="${round(x + 26 + num.width + 10)}" y="${58 + DIGIT_H - 13}" font-family="${SANS}" font-size="15" fill="${p.overlay1}">${esc(tile.unit)}</text>
<rect x="${round(x + 26)}" y="${H - 26}" width="${round(tileW - 52)}" height="3" rx="1.5" fill="${p.surface0}"/>
<rect class="bar" x="${round(x + 26)}" y="${H - 26}" width="${round(tileW - 52)}" height="3" rx="1.5" fill="${color}" style="${delay(start + 0.3)}"/>
</g>`;
    })
    .join('\n');

  const style = `
${Array.from({ length: 10 }, (_, d) => `@keyframes roll${10 + d}{from{transform:translateY(0)}to{transform:translateY(${-(10 + d) * DIGIT_H}px)}}`).join('\n')}
@keyframes grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.bar{transform-box:fill-box;transform-origin:left;animation:grow 1.4s cubic-bezier(.2,.8,.2,1) both}`;

  return document({
    width: W,
    height: H,
    title: 'Estatísticas de contribuição',
    desc: tiles.map((tile) => `${tile.label}: ${tile.value} ${tile.unit}`).join('; '),
    style,
    body,
  });
}
