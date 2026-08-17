import { enZM } from './locales/en-ZM';

export const locales = {
  'en-ZM': enZM,
} as const;

export type CopyKey = keyof typeof enZM;
export type Locale = keyof typeof locales;
export type CopyValues = Record<string, string | number>;

export function createTranslator(locale: Locale = 'en-ZM') {
  return (key: CopyKey, values: CopyValues = {}): string =>
    locales[locale][key].replace(/\{([^}]+)\}/g, (token, name: string) =>
      Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : token,
    );
}

export const t = createTranslator();
