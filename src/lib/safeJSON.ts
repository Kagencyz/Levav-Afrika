/**
 * Safe JSON and input validation utilities
 */

/** Safely parse JSON from localStorage with fallback */
export function safeJSONParse<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Safely serialize and store JSON to localStorage */
export function safeJSONSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silently fail — typically quota exceeded
  }
}

/** Validate email format */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Sanitize user input by trimming and stripping dangerous characters */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input.trim().replace(/[<>]/g, '');
}

/** Validate that end date is after start date */
export function isValidDateRange(startDate: string, endDate: string): boolean {
  if (!startDate || !endDate) return false;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return end > start;
}
