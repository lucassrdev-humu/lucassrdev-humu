const SOURCE = 'https://cdn.jsdelivr.net/npm/simple-icons@16.37.0/icons';

export async function loadIcons(slugs) {
  const icons = {};
  await Promise.all(
    [...new Set(slugs)].map(async (slug) => {
      const res = await fetch(`${SOURCE}/${slug}.svg`);
      if (!res.ok) throw new Error(`icone ${slug}: HTTP ${res.status}`);
      const path = (await res.text()).match(/<path d="([^"]+)"/);
      if (!path) throw new Error(`icone ${slug}: path ausente`);
      icons[slug] = path[1];
    }),
  );
  return icons;
}
