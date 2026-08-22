import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('client notification retirement', () => {
  it('does not present device-local or mock activity as a real notification feed', () => {
    expect(existsSync(resolve('src/components/NotificationBell.tsx'))).toBe(false);
    expect(existsSync(resolve('src/hooks/useNotifications.ts'))).toBe(false);

    for (const file of [
      'src/components/Navbar.tsx',
      'src/pages/TalentDirectory.tsx',
      'src/pages/Messages.tsx',
      'src/pages/JobApply.tsx',
    ]) {
      const source = readFileSync(resolve(file), 'utf8');
      expect(source).not.toContain('NotificationBell');
      expect(source).not.toContain('useNotifications');
      expect(source).not.toContain("'notifications'");
    }
  });
});
