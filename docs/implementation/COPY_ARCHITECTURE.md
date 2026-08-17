# Copy architecture

Levav's governed interface copy lives in `src/copy/locales/en-ZM.ts`. The exported `t`
function accepts only a `CopyKey`, so an unknown key is rejected by TypeScript. Values use
named `{token}` interpolation; call sites pass plain strings or numbers and React escapes the
result normally. The implementation does not evaluate values and does not render HTML.

## Add a key

1. Obtain Product Command approval and add the exact key and value to the appropriate table
   in `docs/product/COPY_DICTIONARY.md` (or its approved supplement).
2. Run `node scripts/generate-copy.mjs`.
3. Use `t('namespace.key')` at the call site and add interpolation values as the second
   argument when needed.
4. Run the copy tests, typecheck, full tests, and build. Never add a runtime fallback for an
   unknown key.

If a needed user-facing string has no approved dictionary key, stop that part of the work and
return `BLOCKED_PRODUCT_DECISION`. Engineering must not invent product copy.

## Add a locale

Add a locale file with the same `CopyKey` shape, import it into `src/copy/index.ts`, and add it
to `locales`. Locale selection happens when `createTranslator(locale)` is created; call sites
continue to call the same typed translator with the same keys. A new locale must define every
key before TypeScript accepts it.

## Drift guard scope

`src/copy/driftGuard.test.ts` checks the six WP-0004 migration targets for prohibited terms
from the Levav Language System. It deliberately grandfathers one pre-existing sentence in the
unmigrated learning-plan area of `SkillGap.tsx`; the SkillGap packet owns that later removal.
The guard does not claim that all legacy application copy is migrated.
