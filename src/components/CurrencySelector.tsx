import { useState, useEffect, useRef } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import {
  SUPPORTED_CURRENCIES,
  getSymbol,
  getPreferredCurrency,
  setPreferredCurrency,
} from "@/lib/currency";

interface CurrencySelectorProps {
  className?: string;
}

/** Human-readable currency labels */
const CURRENCY_LABELS: Record<string, string> = {
  USD: "US Dollar",
  ZMW: "Zambian Kwacha",
  NGN: "Nigerian Naira",
  GHS: "Ghanaian Cedi",
  KES: "Kenyan Shilling",
  ZAR: "South African Rand",
  RWF: "Rwandan Franc",
  TZS: "Tanzanian Shilling",
  EGP: "Egyptian Pound",
  XOF: "West African CFA",
  SLL: "Sierra Leonean Leone",
};

export function CurrencySelector({ className = "" }: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(getPreferredCurrency);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync with localStorage changes from other components
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "preferred_currency") {
        setSelected(getPreferredCurrency());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleSelect = (currency: string) => {
    setSelected(currency);
    setPreferredCurrency(currency);
    setIsOpen(false);
    // Dispatch a custom event so same-tab listeners know the currency changed
    window.dispatchEvent(new Event("currency-changed"));
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white/70 text-sm hover:bg-white/[0.08] hover:text-white hover:border-white/[0.15] transition-all"
        aria-label="Select currency"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 text-[#C6FF34]" />
        <span className="font-medium">
          {getSymbol(selected)} {selected}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-[#1a1a1a] border border-white/[0.08] rounded-xl shadow-2xl shadow-black/40 overflow-hidden z-50">
          <div className="px-3 py-2 border-b border-white/[0.06]">
            <p className="text-white/40 text-xs font-medium uppercase tracking-wider">
              Preferred Currency
            </p>
          </div>
          <div className="max-h-72 overflow-y-auto py-1">
            {SUPPORTED_CURRENCIES.map((currency) => (
              <button
                key={currency}
                onClick={() => handleSelect(currency)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                  selected === currency
                    ? "bg-[#C6FF34]/10 text-[#C6FF34]"
                    : "text-white/70 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <span className="font-semibold w-8 text-left">
                  {getSymbol(currency)}
                </span>
                <span className="flex-1 text-left">
                  {CURRENCY_LABELS[currency] || currency}
                </span>
                {selected === currency && (
                  <Check className="w-4 h-4 text-[#C6FF34]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
