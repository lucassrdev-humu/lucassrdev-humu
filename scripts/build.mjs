import { readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { fetchProfile } from './github.mjs';
import { loadIcons } from './icons.mjs';
import { theme } from './theme.mjs';
import { hero } from './svg/hero.mjs';
import { stats } from './svg/stats.mjs';
import { activity } from './svg/activity.mjs';
import { stack } from './svg/stack.mjs';
import { card } from './svg/card.mjs';

const root = new URL('../', import.meta.url);
const out = new URL('dist/', root);
const cfg = JSON.parse(await readFile(new URL('profile.json', root), 'utf8'));

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
if (!token) {
  console.error('defina GITHUB_TOKEN ou GH_TOKEN');
  process.exit(1);
}

const repos = cfg.projects.map((p) => p.repo).filter(Boolean);
const [data, icons] = await Promise.all([
  fetchProfile(cfg.login, repos, token),
  loadIcons(cfg.stack.flatMap((g) => g.items.map((i) => i.icon)).filter(Boolean)),
]);

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

const files = [];
for (const mode of ['dark', 'light']) {
  const t = theme(mode, cfg.accents);
  const write = async (name, svg) => {
    const file = `${name}-${mode}.svg`;
    await writeFile(new URL(file, out), svg);
    files.push(file);
  };
  await write('hero', hero(cfg, t));
  await write('stats', stats(cfg, data, t));
  await write('activity', activity(cfg, data, t));
  await write('stack', stack(cfg, icons, t));
  for (const project of cfg.projects) {
    await write(`card-${project.id}`, card(project, data.projects[project.repo], t, project.wide ? 1200 : 590));
  }
}

console.log(`${files.length} arquivos em dist/ · ${data.stats.total} contribuicoes · ${data.stats.active} dias ativos`);
