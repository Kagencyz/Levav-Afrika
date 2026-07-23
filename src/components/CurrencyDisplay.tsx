import { useState, useEffect } from "react";
import {
  formatRateString,
  formatSalaryRange,
  getPreferredCurrency,
} from "@/lib/currency";

interface CurrencyDisplayProps {
  /** The amount as a number */
  amount: number;
  /** ISO currency code (e.g., 'ZMW', 'USD') */
  currency: string;
  /** Show the converted amount in user's preferred currency */
  showConverted?: boolean;
  /** Optional CSS class */
  className?: string;
}

/**
 * Display a numeric amount with its currency symbol.
 * Optionally shows a converted value in the user's preferred currency.
 */
export function CurrencyDisplay({
  amount,
  currency,
  showConverted = true,
  className = "",
}: CurrencyDisplayProps) {
  const [userCurrency, setUserCurrency] = useState(getPreferredCurrency);

  useEffect(() => {
    const handleStorage = () => {
      setUserCurrency(getPreferredCurrency());
    };
    window.addEventListener("storage", handleStorage);
    // Also poll for changes from same-tab updates
    const interval = setInterval(() => {
      setUserCurrency(getPreferredCurrency());
    }, 1000);
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  const formatted = `${currency} ${amount.toLocaleString()}`;

  return (
    <span className={className}>
      <span className="text-[#C6FF34] font-semibold">{formatted}</span>
      {showConverted && currency !== userCurrency && (
        <span className="text-white/40 text-sm ml-1.5">
          (~{currency} {(amount * 1).toLocaleString()})
        </span>
      )}
    </span>
  );
}

/* ───────────────────── Rate String Display (for talent cards) ───────────────────── */

interface RateDisplayProps {
  /** Rate string like "ZMW 800/hour", "₦5,000/hour", "Negotiable" */
  rate: string;
  /** Show the converted amount */
  showConverted?: boolean;
  className?: string;
}

/**
 * Display a talent rate string with optional currency conversion.
 * Parses strings like "ZMW 800/hour", "₦5,000/hour", "USD 50/hour".
 */
export function RateDisplay({
  rate,
  showConverted = true,
  className = "",
}: RateDisplayProps) {
  const [userCurrency, setUserCurrency] = useState(getPreferredCurrency);

  useEffect(() => {
    const handleStorage = () => {
      setUserCurrency(getPreferredCurrency());
    };
    window.addEventListener("storage", handleStorage);
    const interval = setInterval(() => {
      setUserCurrency(getPreferredCurrency());
    }, 1000);
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  const { original, converted } = formatRateString(rate, userCurrency);

  return (
    <span className={className}>
      <span className="text-[#C6FF34] font-medium">{original}</span>
      {showConverted && converted && (
        <span className="text-white/40 text-xs ml-1.5">(~{converted})</span>
      )}
    </span>
  );
}

/* ───────────────────── Salary Range Display (for job cards) ───────────────────── */

interface SalaryDisplayProps {
  /** Salary string like "ZMW 15,000 - 25,000", "USD 3,500 - 5,000/month" */
  salary: string;
  /** Show the converted amount */
  showConverted?: boolean;
  className?: string;
}

/**
 * Display a salary range with optional currency conversion.
 * Parses strings like "ZMW 15,000 - 25,000", "USD 3,500 - 5,000/month".
 */
export function SalaryDisplay({
  salary,
  showConverted = true,
  className = "",
}: SalaryDisplayProps) {
  const [userCurrency, setUserCurrency] = useState(getPreferredCurrency);

  useEffect(() => {
    const handleStorage = () => {
      setUserCurrency(getPreferredCurrency());
    };
    window.addEventListener("storage", handleStorage);
    const interval = setInterval(() => {
      setUserCurrency(getPreferredCurrency());
    }, 1000);
    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  const { original, converted } = formatSalaryRange(salary, userCurrency);

  return (
    <span className={className}>
      <span className="text-[#C6FF34] font-medium">{original}</span>
      {showConverted && converted && (
        <span className="text-white/40 text-xs ml-1.5">(~{converted})</span>
      )}
    </span>
  );
}
