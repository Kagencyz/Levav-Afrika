import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migratedSurfaces = [
  'src/pages/NotFound.tsx',
  'src/components/OfflineBanner.tsx',
  'src/pages/Auth.tsx',
  'src/pages/Welcome.tsx',
  'src/lib/onboardingRouting.ts',
  'src/pages/SkillGap.tsx',
];

const prohibited = [
  /\bgigs?\b/i,
  /\bLevav28\b/,
  /\bSkillSpace\b/i,
  /\bseamless\b/i,
  /\bleverage\b/i,
  /\brobust\b/i,
  /\bcutting-edge\b/i,
  /\brevolutionary\b/i,
  /\bgame-changing\b/i,
  /\bsupercharge\b/i,
  /\bempower\b/i,
  /\belevate\b/i,
  /\bunleash\b/i,
  /\bharness\b/i,
  /\bdelve\b/i,
  /\btapestry\b/i,
  /\bin today's fast-paced world\b/i,
  /\bwe're excited to announce\b/i,
  /\bit's important to note\b/i,
];

// WP-0004 migrates only the WRI empty state inside SkillGap. This pre-existing
// learning-plan sentence remains owned by that surface's later packet.
const grandfathered = [
  ['src/pages/SkillGap.tsx', 'Implement robust error handling patterns'],
] as const;

describe('copy drift guard', () => {
  it('keeps prohibited product language out of migrated surfaces', () => {
    const violations = migratedSurfaces.flatMap((path) => {
      const source = readFileSync(path, 'utf8')
        .split('\n')
        .filter((line) => !grandfathered.some(([knownPath, text]) => knownPath === path && line.includes(text)))
        .join('\n');
      return prohibited.filter((pattern) => pattern.test(source)).map((pattern) => `${path}: ${pattern}`);
    });
    expect(violations).toEqual([]);
  });
});
