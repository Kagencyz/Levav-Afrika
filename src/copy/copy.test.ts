import { describe, expect, it } from 'vitest';
import { createTranslator, t } from './index';
import { enZM } from './locales/en-ZM';
import { readFileSync } from 'node:fs';

function approvedDictionaryEntries() {
  const sources: Array<[string, Set<number>]> = [
    ['docs/product/COPY_DICTIONARY.md', new Set([0, 1, 3, 12, 13, 14, 15, 16])],
    ['docs/product/COPY_DICTIONARY_S17_AUTH_WELCOME.md', new Set([17])],
  ];
  const superseded = new Set([
    'global.error.notfound.title',
    'global.error.notfound.body',
    'onboarding.goals.title',
    'onboarding.goals.subtitle',
    'onboarding.status.title',
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
  const entries: Record<string, string> = {};

  for (const [path, sections] of sources) {
    let section: number | null = null;
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const heading = line.match(/^##\s+(\d+)\./);
      if (heading) section = Number(heading[1]);
      if (section === null || !sections.has(section)) continue;
      const row = line.match(/^\| `([^`]+)` \| (.*) \|$/);
      if (row && !superseded.has(row[1])) entries[row[1]] = row[2];
    }
  }
  return entries;
}

describe('typed copy', () => {
  it('interpolates approved values without evaluating them', () => {
    expect(t('auth.verify.sentto', { email: 'person@example.com' })).toBe(
      'We sent a confirmation link to person@example.com.',
    );
    expect(t('welcome.step', { current: 1, total: 2 })).toBe('Step 1 of 2');
    expect(t('notfound.path', { path: '/missing' })).toBe('You asked for: /missing');
  });

  it('creates a locale-independent call-site translator', () => {
    const translate = createTranslator('en-ZM');
    expect(translate('global.action.continue')).toBe('Continue');
  });

  it('preserves an unresolved interpolation token', () => {
    expect(t('welcome.step')).toBe('Step {current} of {total}');
  });

  it('is byte-identical to every approved seeded dictionary value', () => {
    expect(enZM).toEqual(approvedDictionaryEntries());
  });

  // @ts-expect-error Unknown keys must be rejected by TypeScript.
  const unknownKeyProof = () => t('does.not.exist');
  void unknownKeyProof;
});
