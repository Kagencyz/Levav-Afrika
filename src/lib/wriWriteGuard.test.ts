import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import ts from 'typescript';

const root = resolve(process.cwd(), 'src');
const prohibitedExports = new Set([
  'awardWriPoints',
  'saveWriScore',
  'getWriScore',
  'getWriUnlockStatus',
  'isWriInitialized',
]);

function exportedNames(source: string, fileName: string): string[] {
  const file = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true);
  const names: string[] = [];
  file.forEachChild((node) => {
    const exported = node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword);
    if (!exported) return;
    if (ts.isFunctionDeclaration(node) && node.name) names.push(node.name.text);
    if (ts.isVariableStatement(node)) {
      node.declarationList.declarations.forEach((declaration) => {
        if (ts.isIdentifier(declaration.name)) names.push(declaration.name.text);
      });
    }
  });
  return names;
}

describe('client WRI write guard', () => {
  it('rejects WRI-writing exports and persistence outside retired-key cleanup', () => {
    const sourceFiles = [
      'lib/levavData.ts',
      'pages/Learn.tsx',
      'pages/Feed.tsx',
      'pages/QuickWork.tsx',
      'pages/Impact.tsx',
      'pages/Levav28.tsx',
      'pages/Onboarding.tsx',
    ];

    for (const relativePath of sourceFiles) {
      const source = readFileSync(resolve(root, relativePath), 'utf8');
      expect(exportedNames(source, relativePath).filter((name) => prohibitedExports.has(name))).toEqual([]);
      expect(source).not.toMatch(/localStorage\.setItem\([^\n]*(?:wri_score|wriScore)/i);
      expect(source).not.toContain('awardWriPoints');
    }
  });
});
