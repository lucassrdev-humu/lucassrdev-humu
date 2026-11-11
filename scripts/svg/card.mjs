import { MONO, SANS, document, esc, monoWidth, round, delay, mix, wrap, shortDate } from '../lib.mjs';

const H = 236;
const R = 20;

function badgeText(card, live) {
  if (card.badge === 'release' && live?.release) return live.release;
  if (card.badge === 'stars' && live) return `★ ${live.stars}`;
  return card.badge ?? null;
}

function metaText(card, live) {
  const parts = [card.kicker];
  if (live?.releasedAt) parts.push(`versão de ${shortDate(live.releasedAt)}`);
  else if (live?.pushedAt) parts.push(`atualizado em ${shortDate(live.pushedAt)}`);
  return parts.filter(Boolean).join(' · ');
}

export function card(card, live, t, W) {
  const { p, a, dark } = t;
  const [c0, c1] = card.accent !== undefined ? [a[card.accent % a.length], a[(card.accent + 1) % a.length]] : [a[0], a[1]];
  const fill = dark ? mix(p.base, p.mantle, 0.5) : p.mantle;
  const perimeter = round(2 * (W - 1 - 2 * R) + 2 * (H - 1 - 2 * R) + 2 * Math.PI * R);
  const badge = badgeText(card, live);
  const meta = metaText(card, live);
  const lines = wrap(card.description, Math.floor((W - 56) / (15 * 0.53))).slice(0, 3);

  let tagX = 28;
  const tags = card.tags
    .map((tag, i) => {
      const width = monoWidth(tag, 12) + 20;
      if (tagX + width > W - 28) return '';
      const out = `<g class="pop" style="${delay(0.6 + i * 0.05)}">
<rect x="${round(tagX)}" y="${H - 50}" width="${round(width)}" height="26" rx="8" fill="${dark ? p.surface0 : p.base}"/>
<text x="${round(tagX + 10)}" y="${H - 33}" font-family="${MONO}" font-size="12" fill="${p.subtext1}">${esc(tag)}</text>
</g>`;
      tagX += width + 8;
      return out;
    })
    .join('');

  const badgeSvg = badge
    ? (() => {
        const width = monoWidth(badge, 12) + 34;
        const x = W - 28 - width;
        return `<g class="fade" style="${delay(0.5)}">
<rect x="${round(x)}" y="30" width="${round(width)}" height="26" rx="13" fill="${mix(fill, p.green, dark ? 0.14 : 0.12)}" stroke="${mix(fill, p.green, 0.45)}"/>
<circle cx="${round(x + 14)}" cy="43" r="3.5" fill="${p.green}" style="animation:pulse 2s ease-in-out infinite"/>
<text x="${round(x + 24)}" y="47.5" font-family="${MONO}" font-size="12" fill="${p.text}">${esc(badge)}</text>
</g>`;
      })()
    : '';

  const style = `
@keyframes orbit{from{stroke-dashoffset:0}to{stroke-dashoffset:-${perimeter}}}
.orbit{animation:orbit 8s linear infinite}
.orbit2{animation:orbit 8s linear -4s infinite}
@keyframes float{from{transform:translate(0,0)}to{transform:translate(-24px,-10px)}}
.drift{animation:float 9s ease-in-out infinite alternate}`;

  const defs = `<clipPath id="cardclip"><rect width="${W}" height="${H}" rx="${R}"/></clipPath>
<linearGradient id="mono" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c0}"/><stop offset="1" stop-color="${c1}"/></linearGradient>
<radialGradient id="glow" cx="1" cy="0" r="1"><stop offset="0" stop-color="${c0}" stop-opacity="${dark ? 0.18 : 0.14}"/><stop offset="1" stop-color="${c0}" stop-opacity="0"/></radialGradient>`;

  const watermark = W > 800
    ? `<g clip-path="url(#cardclip)"><text class="drift" x="${W - 40}" y="${H + 30}" text-anchor="end" font-family="${MONO}" font-size="230" font-weight="800" fill="url(#mono)" fill-opacity="${dark ? 0.09 : 0.12}">${esc(card.monogram)}</text></g>`
    : '';

  const body = `<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="${R}" fill="${fill}"/>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="${R}" fill="url(#glow)"/>
${watermark}
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="${R}" stroke="${p.surface0}"/>
<rect class="orbit" x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="${R}" stroke="${c0}" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="140 ${round(perimeter - 140)}"/>
<rect class="orbit2" x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="${R}" stroke="${c1}" stroke-opacity=".7" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="70 ${round(perimeter - 70)}"/>
<g class="rise">
<rect x="28" y="28" width="48" height="48" rx="13" fill="url(#mono)"/>
<text x="52" y="58.5" text-anchor="middle" font-family="${MONO}" font-size="18" font-weight="800" fill="${p.base}">${esc(card.monogram)}</text>
<text x="92" y="50" font-family="${SANS}" font-size="22" font-weight="700" fill="${p.text}">${esc(card.title)}</text>
<text x="92" y="72" font-family="${MONO}" font-size="12.5" fill="${p.overlay1}">${esc(meta)}</text>
</g>
${badgeSvg}
<g class="rise" style="${delay(0.25)}" font-family="${SANS}" font-size="15" fill="${p.subtext0}">${lines.map((l, i) => `<text x="28" y="${114 + i * 22}">${esc(l)}</text>`).join('')}</g>
${tags}`;

  return document({ width: W, height: H, title: card.title, desc: card.description, style, defs, body });
}
