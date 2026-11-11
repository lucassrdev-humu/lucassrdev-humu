export const MONO = `ui-monospace,'JetBrains Mono','SF Mono','Cascadia Code',Menlo,Consolas,monospace`;
export const SANS = `-apple-system,BlinkMacSystemFont,'Segoe UI Variable Display','Segoe UI',Inter,Roboto,'Helvetica Neue',Arial,sans-serif`;
export const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const chars = (s) => [...String(s)].length;
export const monoWidth = (s, size) => chars(s) * size * 0.6;
export const round = (n) => Math.round(n * 100) / 100;

export function mix(a, b, t) {
  const pa = a.match(/\w\w/g).map((h) => parseInt(h, 16));
  const pb = b.match(/\w\w/g).map((h) => parseInt(h, 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('');
}

export function wrap(text, max) {
  const lines = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    if (line && chars(line + ' ' + word) > max) {
      lines.push(line);
      line = word;
    } else {
      line = line ? line + ' ' + word : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function shortDate(iso) {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export const formatNumber = (n) => n.toLocaleString('pt-BR');

const BASE_STYLE = `
@keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes fade{from{opacity:0}to{opacity:1}}
@keyframes pop{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:none}}
@keyframes blink{0%{opacity:1}50%{opacity:0}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}
.rise{animation:rise .7s cubic-bezier(.2,.8,.2,1) both}
.fade{animation:fade .5s ease-out both}
.pop{animation:pop .5s cubic-bezier(.3,1.4,.5,1) both;transform-box:fill-box;transform-origin:center}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;

export function document({ width, height, title, desc, style = '', defs = '', body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title>
<desc id="desc">${esc(desc)}</desc>
<style>${BASE_STYLE}${style}</style>
<defs>${defs}</defs>
${body}
</svg>
`;
}

export const delay = (s) => `animation-delay:${round(s)}s`;
