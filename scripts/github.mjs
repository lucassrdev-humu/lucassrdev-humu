const API = 'https://api.github.com';

const QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel } }
      }
    }
  }
}`;

function headers(token) {
  return {
    Authorization: `bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'profile-build',
  };
}

async function graphql(token, query, variables) {
  const res = await fetch(`${API}/graphql`, {
    method: 'POST',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`GraphQL ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors) throw new Error(`GraphQL: ${JSON.stringify(json.errors)}`);
  return json.data;
}

async function rest(token, path) {
  const res = await fetch(`${API}${path}`, { headers: headers(token) });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET ${path} ${res.status}: ${await res.text()}`);
  return res.json();
}

const LEVELS = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

export function summarize(days) {
  let longest = 0;
  let run = 0;
  for (const day of days) {
    run = day.count > 0 ? run + 1 : 0;
    longest = Math.max(longest, run);
  }
  let i = days.length - 1;
  if (i >= 0 && days[i].count === 0) i--;
  let current = 0;
  while (i >= 0 && days[i].count > 0) {
    current++;
    i--;
  }
  return {
    total: days.reduce((sum, d) => sum + d.count, 0),
    active: days.filter((d) => d.count > 0).length,
    longest,
    current,
  };
}

export async function fetchProfile(login, repos, token) {
  const data = await graphql(token, QUERY, { login });
  if (!data.user) throw new Error(`usuario ${login} nao encontrado`);
  const days = data.user.contributionsCollection.contributionCalendar.weeks
    .flatMap((w) => w.contributionDays)
    .map((d) => ({ date: d.date, count: d.contributionCount, level: LEVELS[d.contributionLevel] ?? 0 }));

  const projects = {};
  for (const repo of repos) {
    const info = await rest(token, `/repos/${repo}`);
    if (!info) throw new Error(`repositorio ${repo} nao encontrado`);
    const release = await rest(token, `/repos/${repo}/releases/latest`);
    projects[repo] = {
      stars: info.stargazers_count,
      pushedAt: info.pushed_at,
      release: release?.tag_name ?? null,
      releasedAt: release?.published_at ?? null,
    };
  }

  return { days, stats: summarize(days), projects };
}
