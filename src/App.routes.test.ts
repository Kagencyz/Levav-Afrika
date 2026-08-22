import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve('src/App.tsx'), 'utf8');
const declaredRoutes = new Set(
  [...source.matchAll(/<Route\s+path="([^"]+)"/g)].map((match) => match[1])
);

function routeExists(path: string) {
  return [...declaredRoutes].some((route) => {
    const pattern = route
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/:[^/]+/g, '[^/]+')
      .replace('\\*', '.*');
    return new RegExp(`^${pattern}$`).test(path);
  });
}

describe('application route map', () => {
  it.each([
    '/',
    '/dashboard',
    '/profile/create',
    '/opportunities',
    '/jobs/example-job',
    '/apply/example-job',
    '/projects',
    '/contract/example-booking',
    '/payments/example-booking',
    '/messages',
    '/settings',
    '/employer/jobs',
    '/employer/analytics',
    '/talent/analytics',
    '/quickwork',
    '/levav28',
  ])('has a declared destination for %s', (path) => {
    expect(routeExists(path)).toBe(true);
  });

  it.each(['/welcome', '/onboarding', '/profile/create'])(
    'protects the member-owned route %s',
    (path) => {
      const escapedPath = path.replace('/', '\\/');
      expect(source).toMatch(new RegExp(
        `path="${escapedPath}"[\\s\\S]*?<ProtectedRoute>[\\s\\S]*?</ProtectedRoute>`,
      ));
    },
  );
});
