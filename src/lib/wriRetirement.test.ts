import { describe, expect, it, vi } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { clearRetiredLocalState } from './retiredLocalState';

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = resolve(directory, entry);
    return statSync(path).isDirectory() ? sourceFiles(path) : /\.(ts|tsx)$/.test(path) ? [path] : [];
  });
}

describe('WP-0003 WRI retirement guard', () => {
  it('does not export or call a client-side WRI writer', () => {
    const productionSources = sourceFiles(resolve(process.cwd(), 'src')).filter(
      (path) => !path.endsWith('.test.ts') && !path.endsWith('.test.tsx'),
    );
    const source = productionSources.map((path) => readFileSync(path, 'utf8')).join('\n');

    const forbiddenWriterNames = [
      ['award', 'Wri', 'Points'],
      ['save', 'Wri', 'Score'],
      ['WRI', '_SCORING', '_RULES'],
      ['get', 'Wri', 'Unlock', 'Status'],
    ].map((parts) => parts.join(''));
    for (const name of forbiddenWriterNames) expect(source).not.toContain(name);
    expect(source).not.toMatch(/localStorage\.setItem\(\s*['"](?:wriScore|wri_score)['"]/);
  });

  it('clears the retired WRI and audit keys without writing replacement state', () => {
    const removeItem = vi.fn();
    clearRetiredLocalState({ removeItem });
    expect(removeItem).toHaveBeenCalledWith('wri_score');
    expect(removeItem).toHaveBeenCalledWith('levav_audit_log');
  });
});
