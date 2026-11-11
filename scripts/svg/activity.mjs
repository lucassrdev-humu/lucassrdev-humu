import { MONO, SANS, MONTHS, document, esc, formatNumber, round, mix } from '../lib.mjs';

const W = 1200;
const H = 262;
const CELL = 15;
const STEP = 19;
const TOP = 92;

export function activity(cfg, data, t) {
  const { p, a, dark } = t;
  const empty = dark ? p.surface0 : mix(p.crust, p.surface0, 0.5);
  const levels = [empty, ...[0.32, 0.55, 0.78, 1].map((k) => mix(empty, a[0], k))];

  const firstDay = new Date(`${data.days[0].date}T00:00:00Z`).getUTCDay();
  const columns = Math.ceil((data.days.length + firstDay) / 7);
  const gridW = columns * STEP - (STEP - CELL);
  const left = Math.round((W - gridW) / 2) + 14;

  const cells = [];
  const months = [];
  let lastMonth = -1;
  data.days.forEach((day, i) => {
    const slot = i + firstDay;
    const col = Math.floor(slot / 7);
    const row = slot % 7;
    const x = left + col * STEP;
    const y = TOP + row * STEP;
    const month = new Date(`${day.date}T00:00:00Z`).getUTCMonth();
    if (month !== lastMonth && row <= 3 && col < columns - 2) {
      months.push(`<text x="${x}" y="${TOP - 14}" fill="${p.overlay1}">${MONTHS[month]}</text>`);
      lastMonth = month;
    }
    const hot = day.level === 4 ? ' hot' : '';
    cells.push(`<rect class="cell${hot}" x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="4" fill="${levels[day.level]}" style="animation-delay:${round(0.2 + col * 0.022 + row * 0.03)}s${hot ? `,${round(2 + (col % 7) * 0.31)}s` : ''}"><title>${day.date}: ${day.count}</title></rect>`);
  });

  const legendX = W - 40 - 5 * STEP;
  const legend = levels
    .map((c, i) => `<rect x="${legendX + i * STEP}" y="${H - 38}" width="${CELL}" height="${CELL}" rx="4" fill="${c}"/>`)
    .join('');

  const weekdays = [[1, 'seg'], [3, 'qua'], [5, 'sex']]
    .map(([row, label]) => `<text x="${left - 12}" y="${TOP + row * STEP + 12}" text-anchor="end" fill="${p.overlay1}">${label}</text>`)
    .join('');

  const style = `
@keyframes cellin{from{opacity:0;transform:scale(.2)}to{opacity:1;transform:none}}
@keyframes hot{0%,100%{opacity:1}50%{opacity:.55}}
@keyframes sweep{0%{transform:translateX(0)}45%,100%{transform:translateX(${W + 260}px)}}
.cell{transform-box:fill-box;transform-origin:center;animation:cellin .45s cubic-bezier(.3,1.4,.5,1) both}
.hot{animation:cellin .45s cubic-bezier(.3,1.4,.5,1) both,hot 2.6s ease-in-out infinite}
.beam{animation:sweep 9s cubic-bezier(.45,0,.55,1) 2.4s infinite}`;

  const defs = `
<linearGradient id="beam" x1="0" x2="1"><stop offset="0" stop-color="${a[1]}" stop-opacity="0"/><stop offset=".5" stop-color="${a[1]}" stop-opacity="${dark ? 0.35 : 0.28}"/><stop offset="1" stop-color="${a[1]}" stop-opacity="0"/></linearGradient>
<clipPath id="gridclip"><rect x="${left - 4}" y="${TOP - 4}" width="${gridW + 8}" height="${7 * STEP + 4}"/></clipPath>`;

  const fill = dark ? mix(p.base, p.mantle, 0.5) : p.mantle;
  const body = `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="18" fill="${fill}" stroke="${p.surface0}"/>
<g class="rise">
<rect x="26" y="28" width="8" height="8" rx="2" fill="${a[0]}"/>
<text x="44" y="36" font-family="${MONO}" font-size="13" letter-spacing="1" fill="${p.subtext0}">ATIVIDADE · ÚLTIMOS 12 MESES</text>
<text x="${W - 28}" y="37" text-anchor="end" font-family="${SANS}" font-size="15" fill="${p.overlay1}"><tspan fill="${p.text}" font-weight="700">${formatNumber(data.stats.total)}</tspan> contribuições</text>
</g>
<g font-family="${MONO}" font-size="12">${months.join('')}${weekdays}</g>
${cells.join('\n')}
<g clip-path="url(#gridclip)"><rect class="beam" x="${left - 260}" y="${TOP - 4}" width="220" height="${7 * STEP + 4}" fill="url(#beam)"/></g>
<text x="${legendX - 10}" y="${H - 26}" text-anchor="end" font-family="${MONO}" font-size="12" fill="${p.overlay1}">menos</text>
${legend}
<text x="${legendX + 5 * STEP}" y="${H - 26}" font-family="${MONO}" font-size="12" fill="${p.overlay1}">mais</text>`;

  return document({
    width: W,
    height: H,
    title: 'Atividade dos últimos 12 meses',
    desc: `${data.stats.total} contribuições em ${data.stats.active} dias ativos.`,
    style,
    defs,
    body,
  });
}
