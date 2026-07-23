// Exchange rates (approximate, USD-based)
const RATES: Record<string, number> = {
  USD: 1,
  ZMW: 26.5,
  NGN: 1500,
  GHS: 15.8,
  KES: 129,
  ZAR: 18.2,
  RWF: 1330,
  TZS: 2580,
  EGP: 48.5,
  XOF: 605,
  SLL: 22500,
};

const SYMBOLS: Record<string, string> = {
  USD: "$",
  ZMW: "ZMW",
  NGN: "\u20A6",
  GHS: "GHS",
  KES: "KES",
  ZAR: "R",
  RWF: "RWF",
  TZS: "TZS",
  EGP: "EGP",
  XOF: "CFA",
  SLL: "SLL",
};

/** All supported currency codes */
export const SUPPORTED_CURRENCIES = Object.keys(RATES);

/** Get the display symbol for a currency code */
export function getSymbol(currency: string): string {
  return SYMBOLS[currency] || currency;
}

/** Convert an amount from one currency to another */
export function convert(amount: number, from: string, to: string): number {
  const fromRate = RATES[from];
  const toRate = RATES[to];
  if (!fromRate || !toRate) return amount;
  const usd = amount / fromRate;
  return Math.round(usd * toRate * 100) / 100;
}

/** Format a numeric amount with the currency symbol */
export function format(amount: number, currency: string): string {
  const symbol = SYMBOLS[currency] || currency;
  return `${symbol} ${amount.toLocaleString()}`;
}

/** Convert and format in one step */
export function convertAndFormat(
  amount: number,
  from: string,
  to: string
): string {
  return format(convert(amount, from, to), to);
}

/**
 * Parse a rate string like "ZMW 800/hour", "₦5,000/hour",
 * "USD 50/hour", "Negotiable" into { amount, currency, suffix }.
 */
export function parseRateString(rate: string): {
  amount: number;
  currency: string;
  suffix: string;
  isNegotiable: boolean;
} {
  const trimmed = rate.trim();

  // Handle negotiable
  if (trimmed.toLowerCase() === "negotiable") {
    return { amount: 0, currency: "USD", suffix: "", isNegotiable: true };
  }

  // Common currency symbols / prefixes
  const currencyPatterns: { pattern: RegExp; currency: string }[] = [
    { pattern: /^USD\s*/i, currency: "USD" },
    { pattern: /^ZMW\s*/i, currency: "ZMW" },
    { pattern: /^GHS\s*/i, currency: "GHS" },
    { pattern: /^KES\s*/i, currency: "KES" },
    { pattern: /^ZAR\s*/i, currency: "ZAR" },
    { pattern: /^RWF\s*/i, currency: "RWF" },
    { pattern: /^TZS\s*/i, currency: "TZS" },
    { pattern: /^EGP\s*/i, currency: "EGP" },
    { pattern: /^CFA\s*/i, currency: "XOF" },
    { pattern: /^SLL\s*/i, currency: "SLL" },
    { pattern: /^\u20A6\s*/i, currency: "NGN" }, // ₦
    { pattern: /^R\s*/i, currency: "ZAR" },
    { pattern: /^\$\s*/i, currency: "USD" },
  ];

  let currency = "USD";
  let remaining = trimmed;

  for (const { pattern, currency: curr } of currencyPatterns) {
    if (pattern.test(trimmed)) {
      currency = curr;
      remaining = trimmed.replace(pattern, "").trim();
      break;
    }
  }

  // Extract numeric portion — handles ranges like "15,000 - 25,000" by taking the first number
  const numberMatch = remaining.match(/[\d,]+(?:\.\d+)?/);
  if (!numberMatch) {
    return { amount: 0, currency, suffix: remaining, isNegotiable: false };
  }

  const amount = parseFloat(numberMatch[0].replace(/,/g, ""));
  const suffix = remaining.replace(numberMatch[0], "").trim();

  return { amount, currency, suffix, isNegotiable: false };
}

/** Parse and format a rate string for display */
export function formatRateString(
  rate: string,
  targetCurrency: string
): { original: string; converted: string | null } {
  const parsed = parseRateString(rate);

  if (parsed.isNegotiable) {
    return { original: "Negotiable", converted: null };
  }

  const formatted = format(parsed.amount, parsed.currency);
  const suffix = parsed.suffix ? ` ${parsed.suffix}` : "";
  const original = `${formatted}${suffix}`;

  let converted: string | null = null;
  if (
    parsed.currency !== targetCurrency &&
    RATES[parsed.currency] &&
    RATES[targetCurrency]
  ) {
    converted = `${convertAndFormat(parsed.amount, parsed.currency, targetCurrency)}${suffix}`;
  }

  return { original, converted };
}

/**
 * Parse a salary range string like "ZMW 15,000 - 25,000/month"
 * into { min, max, currency, period }.
 */
export function parseSalaryRange(salary: string): {
  min: number;
  max: number;
  currency: string;
  period: string;
} {
  const trimmed = salary.trim();

  // Currency detection
  const currencyPatterns: { pattern: RegExp; currency: string }[] = [
    { pattern: /^USD\s*/i, currency: "USD" },
    { pattern: /^ZMW\s*/i, currency: "ZMW" },
    { pattern: /^GHS\s*/i, currency: "GHS" },
    { pattern: /^KES\s*/i, currency: "KES" },
    { pattern: /^ZAR\s*/i, currency: "ZAR" },
    { pattern: /^RWF\s*/i, currency: "RWF" },
    { pattern: /^TZS\s*/i, currency: "TZS" },
    { pattern: /^EGP\s*/i, currency: "EGP" },
    { pattern: /^CFA\s*/i, currency: "XOF" },
    { pattern: /^SLL\s*/i, currency: "SLL" },
    { pattern: /^\u20A6\s*/i, currency: "NGN" },
    { pattern: /^R\s*/i, currency: "ZAR" },
    { pattern: /^\$\s*/i, currency: "USD" },
  ];

  let currency = "USD";
  let remaining = trimmed;

  for (const { pattern, currency: curr } of currencyPatterns) {
    if (pattern.test(trimmed)) {
      currency = curr;
      remaining = trimmed.replace(pattern, "").trim();
      break;
    }
  }

  // Extract all numbers
  const numbers = remaining
    .match(/[\d,]+(?:\.\d+)?/g)
    ?.map((n) => parseFloat(n.replace(/,/g, "")));

  const period = remaining.replace(/[\d,\s\-]+/g, "").trim() || "";

  if (!numbers || numbers.length === 0) {
    return { min: 0, max: 0, currency, period };
  }

  if (numbers.length === 1) {
    return { min: numbers[0], max: numbers[0], currency, period };
  }

  return { min: numbers[0], max: numbers[1], currency, period };
}

/** Format a salary range for display with optional conversion */
export function formatSalaryRange(
  salary: string,
  targetCurrency: string
): { original: string; converted: string | null } {
  const parsed = parseSalaryRange(salary);
  const period = parsed.period ? `/${parsed.period}` : "";

  const originalSymbol = getSymbol(parsed.currency);
  let original: string;
  if (parsed.min === parsed.max) {
    original = `${originalSymbol} ${parsed.min.toLocaleString()}${period}`;
  } else {
    original = `${originalSymbol} ${parsed.min.toLocaleString()} - ${parsed.max.toLocaleString()}${period}`;
  }

  let converted: string | null = null;
  if (
    parsed.currency !== targetCurrency &&
    RATES[parsed.currency] &&
    RATES[targetCurrency]
  ) {
    const convertedMin = convert(parsed.min, parsed.currency, targetCurrency);
    const convertedMax = convert(parsed.max, parsed.currency, targetCurrency);
    const targetSymbol = getSymbol(targetCurrency);
    if (parsed.min === parsed.max) {
      converted = `${targetSymbol} ${convertedMin.toLocaleString()}${period}`;
    } else {
      converted = `${targetSymbol} ${convertedMin.toLocaleString()} - ${convertedMax.toLocaleString()}${period}`;
    }
  }

  return { original, converted };
}

// Detect currency from country
export function currencyFromCountry(country: string): string {
  const map: Record<string, string> = {
    Zambia: "ZMW",
    Nigeria: "NGN",
    Ghana: "GHS",
    Kenya: "KES",
    "South Africa": "ZAR",
    Rwanda: "RWF",
    Tanzania: "TZS",
    Egypt: "EGP",
    Senegal: "XOF",
    "Sierra Leone": "SLL",
    Zimbabwe: "USD",
  };
  return map[country] || "USD";
}

/** Store user's preferred currency in localStorage */
const STORAGE_KEY = "preferred_currency";

export function getPreferredCurrency(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) || "USD";
  } catch {
    return "USD";
  }
}

export function setPreferredCurrency(currency: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, currency);
  } catch {
    // Silently fail in private mode
  }
}
