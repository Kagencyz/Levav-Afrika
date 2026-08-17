import { readFileSync, writeFileSync } from 'node:fs';

const sources = [
  ['docs/product/COPY_DICTIONARY.md', new Set([0, 1, 3, 12, 13, 14, 15, 16])],
  ['docs/product/COPY_DICTIONARY_S17_AUTH_WELCOME.md', new Set([17])],
];

const superseded = new Set([
  'global.error.notfound.title',
  'global.error.notfound.body',
  'onboarding.goals.title',
  'onboarding.goals.subtitle',
  'onboarding.status.title',
  // WP-0102 retires the transitional slug-map rows and legacy labels from
  // §17.7–17.8 after migrating persisted values to the four-axis model.
  'develop',
  'find-job',
  'find-quickwork',
  'learn',
  'find-volunteer',
  'community',
  'hire',
  'post-quickwork',
  'post-volunteer',
  'intent.post_contribution',
  'employed',
  'self_employed',
  'freelancing',
  'studying',
  'unemployed',
  'returning_to_work',
  'running_organization',
  'volunteering',
  'changing_careers',
  'situation.legacy.volunteering',
  'situation.legacy.changing_careers',
]);

const entries = new Map();
for (const [path, sections] of sources) {
  let section = null;
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const heading = line.match(/^##\s+(\d+)\./);
    if (heading) section = Number(heading[1]);
    if (!sections.has(section)) continue;
    const row = line.match(/^\| `([^`]+)` \| (.*) \|$/);
    if (!row || row[1] === 'Key' || superseded.has(row[1])) continue;
    if (entries.has(row[1])) throw new Error(`Duplicate copy key: ${row[1]}`);
    entries.set(row[1], row[2]);
  }
}

const body = [...entries]
  .map(([key, value]) => `  ${JSON.stringify(key)}: ${JSON.stringify(value)},`)
  .join('\n');

writeFileSync(
  'src/copy/locales/en-ZM.ts',
  `// Generated from the approved copy dictionaries by scripts/generate-copy.mjs.\n` +
    `// Do not edit values here; update the governed dictionary first.\n` +
    `export const enZM = {\n${body}\n} as const;\n`,
);

console.log(`Generated ${entries.size} approved copy keys.`);
