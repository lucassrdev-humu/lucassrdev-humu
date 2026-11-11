import { MONO, SANS, document, esc, monoWidth, chars, round, delay, mix } from '../lib.mjs';

const W = 1200;
const H = 440;
const TERM = { x: 652, y: 52, w: 500, h: 336 };
const FONT = 15;
const CW = FONT * 0.6;
const LH = 29;
const TYPE_SPEED = 0.05;

function segments(line, x, y, colors) {
  let cursor = x;
  return line
    .map(([text, color]) => {
      const width = monoWidth(text, FONT);
      const out = `<text xml:space="preserve" style="white-space:pre" x="${round(cursor)}" y="${y}" fill="${colors[color] ?? colors.text}" textLength="${round(width)}" lengthAdjust="spacingAndGlyphs">${esc(text)}</text>`;
      cursor += width;
      return out;
    })
    .join('');
}

function terminal(cfg, t) {
  const { term, ta } = t;
  const colors = { text: term.text, muted: term.overlay1, accent: ta[0], accent2: ta[1], accent3: ta[2], green: term.green, yellow: term.yellow };
  const x0 = TERM.x + 22;
  const promptWidth = CW * 2;
  let time = 1.0;
  const keyframes = [];
  const rows = [];

  cfg.hero.terminal.forEach((line, i) => {
    const y = TERM.y + 80 + i * LH;
    if (line.cmd !== undefined) {
      const n = chars(line.cmd);
      const width = monoWidth(line.cmd, FONT);
      const duration = Math.max(n * TYPE_SPEED, 0.2);
      const start = time;
      keyframes.push(`@keyframes type${i}{from{transform:translateX(0)}to{transform:translateX(${round(width)}px)}}`);
      rows.push(`<g class="fade" style="${delay(start - 0.15)}">
<text x="${x0}" y="${y}" fill="${ta[0]}">❯</text>
${segments([[line.cmd, 'text']], x0 + promptWidth, y, colors)}
<g style="transform:translateX(${round(width)}px);animation:type${i} ${round(duration)}s steps(${n}) ${round(start)}s both">
<rect x="${round(x0 + promptWidth)}" y="${y - FONT - 2}" width="${TERM.w}" height="${LH}" fill="${term.mantle}"/>
<rect class="cur" x="${round(x0 + promptWidth)}" y="${y - FONT + 1}" width="${round(CW)}" height="${FONT + 3}" fill="${ta[0]}" style="animation:shown ${round(duration + 0.3)}s step-end ${round(start)}s"/>
</g>
</g>`);
      time = start + duration + 0.35;
    } else {
      rows.push(`<g class="rise" style="${delay(time)}">${segments(line.out, x0 + (line.indent ? promptWidth : 0), y, colors)}</g>`);
      time += 0.14;
      const next = cfg.hero.terminal[i + 1];
      if (next && next.cmd !== undefined) time += 0.45;
    }
  });

  const lastY = TERM.y + 80 + cfg.hero.terminal.length * LH;
  rows.push(`<g class="fade" style="${delay(time)}">
<text x="${x0}" y="${lastY}" fill="${ta[0]}">❯</text>
<rect x="${round(x0 + promptWidth)}" y="${lastY - FONT + 1}" width="${round(CW)}" height="${FONT + 3}" fill="${ta[0]}" style="animation:blink 1.1s step-end ${round(time)}s infinite"/>
</g>`);

  const title = cfg.hero.terminalTitle;
  const chrome = `<g class="rise" style="${delay(0.35)}">
<rect x="${TERM.x}" y="${TERM.y}" width="${TERM.w}" height="${TERM.h}" rx="14" fill="${term.mantle}" filter="url(#shadow)"/>
<rect x="${TERM.x + 0.5}" y="${TERM.y + 0.5}" width="${TERM.w - 1}" height="${TERM.h - 1}" rx="13.5" stroke="${term.surface1}" stroke-opacity=".9"/>
<path d="M${TERM.x} ${TERM.y + 40}h${TERM.w}" stroke="${term.surface0}"/>
<circle cx="${TERM.x + 22}" cy="${TERM.y + 20}" r="6" fill="${term.red}"/>
<circle cx="${TERM.x + 42}" cy="${TERM.y + 20}" r="6" fill="${term.yellow}"/>
<circle cx="${TERM.x + 62}" cy="${TERM.y + 20}" r="6" fill="${term.green}"/>
<text x="${TERM.x + TERM.w / 2}" y="${TERM.y + 25}" text-anchor="middle" font-size="13" fill="${term.overlay1}">${esc(title)}</text>
</g>`;

  return {
    keyframes: keyframes.join('\n'),
    body: `<g font-family="${MONO}" font-size="${FONT}">${chrome}<g clip-path="url(#termclip)">${rows.join('\n')}</g></g>`,
  };
}

export function hero(cfg, t) {
  const { p, a, dark } = t;
  const h = cfg.hero;
  const term = terminal(cfg, t);
  const blobOpacity = dark ? 0.42 : 0.3;

  let pillX = 64;
  const pills = h.pills
    .map((label, i) => {
      const width = monoWidth(label, 13) + 28;
      const out = `<g class="pop" style="${delay(1.1 + i * 0.08)}">
<rect x="${round(pillX)}" y="322" width="${round(width)}" height="32" rx="16" fill="${mix(p.base, a[i % a.length], dark ? 0.14 : 0.1)}" stroke="${mix(p.base, a[i % a.length], dark ? 0.45 : 0.4)}"/>
<text x="${round(pillX + width / 2)}" y="343" text-anchor="middle" font-family="${MONO}" font-size="13" fill="${p.text}">${esc(label)}</text>
</g>`;
      pillX += width + 10;
      return out;
    })
    .join('\n');

  const tagline = h.tagline
    .map((line, i) => `<text x="64" y="${266 + i * 26}" font-size="17" fill="${p.subtext0}">${esc(line)}</text>`)
    .join('');

  const style = `
@keyframes drift1{0%{transform:translate(0,0) scale(1)}100%{transform:translate(90px,40px) scale(1.15)}}
@keyframes drift2{0%{transform:translate(0,0) scale(1.1)}100%{transform:translate(-110px,-30px) scale(.95)}}
@keyframes drift3{0%{transform:translate(0,0)}100%{transform:translate(-60px,70px) scale(1.2)}}
@keyframes shine{0%{transform:translateX(0)}28%,100%{transform:translateX(820px)}}
@keyframes shown{0%,100%{opacity:1}}
.blob{transform-box:fill-box;transform-origin:center}
.b1{animation:drift1 17s ease-in-out infinite alternate}
.b2{animation:drift2 21s ease-in-out infinite alternate}
.b3{animation:drift3 19s ease-in-out infinite alternate}
.cur{opacity:0}
.shine{animation:shine 7s cubic-bezier(.4,0,.2,1) 1.6s infinite}
${term.keyframes}`;

  const defs = `
<clipPath id="frame"><rect width="${W}" height="${H}" rx="24"/></clipPath>
<clipPath id="termclip"><rect x="${TERM.x}" y="${TERM.y + 41}" width="${TERM.w}" height="${TERM.h - 41}" rx="14"/></clipPath>
${a.map((c, i) => `<radialGradient id="g${i}"><stop offset="0" stop-color="${c}" stop-opacity="${blobOpacity}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join('')}
<linearGradient id="name" gradientUnits="userSpaceOnUse" x1="64" y1="0" x2="580" y2="0">
<stop offset="0" stop-color="${a[0]}"/><stop offset=".55" stop-color="${a[1]}"/><stop offset="1" stop-color="${a[2]}"/>
</linearGradient>
<linearGradient id="shinegrad"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity="${dark ? 0.85 : 0.7}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.1" fill="${p.overlay0}" fill-opacity="${dark ? 0.35 : 0.4}"/></pattern>
<radialGradient id="fadeg" cx=".3" cy=".4" r=".8"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<mask id="fadem"><rect width="${W}" height="${H}" fill="url(#fadeg)"/></mask>
<mask id="namemask"><text x="64" y="186" font-family="${SANS}" font-size="58" font-weight="800" letter-spacing="-1.5" fill="#fff">${esc(h.name)}</text></mask>
<filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity="${dark ? 0.45 : 0.22}"/></filter>`;

  const body = `<g clip-path="url(#frame)" font-family="${SANS}">
<rect width="${W}" height="${H}" fill="${p.base}"/>
<ellipse class="blob b1" cx="230" cy="110" rx="380" ry="260" fill="url(#g0)"/>
<ellipse class="blob b2" cx="1010" cy="380" rx="420" ry="280" fill="url(#g1)"/>
<ellipse class="blob b3" cx="700" cy="20" rx="320" ry="220" fill="url(#g2)"/>
<rect width="${W}" height="${H}" fill="url(#dots)" mask="url(#fadem)"/>
<g class="rise" style="${delay(0.1)}">
<circle cx="70" cy="112" r="4.5" fill="${p.green}" style="animation:pulse 2.4s ease-in-out infinite"/>
<text x="84" y="117" font-family="${MONO}" font-size="14" fill="${p.overlay1}">${esc(h.eyebrow)}</text>
</g>
<g class="rise" style="${delay(0.2)}">
<text x="64" y="186" font-size="58" font-weight="800" letter-spacing="-1.5" fill="url(#name)">${esc(h.name)}</text>
<g mask="url(#namemask)"><rect class="shine" x="-200" y="120" width="160" height="90" fill="url(#shinegrad)"/></g>
</g>
<text class="rise" style="${delay(0.35)}" x="64" y="228" font-size="22" font-weight="600" fill="${p.subtext1}">${esc(h.role)}</text>
<g class="rise" style="${delay(0.5)}">${tagline}</g>
${pills}
${term.body}
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="23.5" stroke="${p.surface1}" stroke-opacity="${dark ? 0.7 : 0.9}"/>
</g>`;

  return document({ width: W, height: H, title: `${h.name} — ${h.role}`, desc: [h.role, ...h.tagline].join(' '), style, defs, body });
}
