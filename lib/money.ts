// Shared money helpers, safe to use on both server and client.

/** Every aggregate (balance, totals, budgets) is expressed in this currency. */
export const BASE_CURRENCY = "INR";

export const currencies = [
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" },
  { value: "GBP", label: "British Pound (£)" },
  { value: "INR", label: "Indian Rupee (₹)" },
  { value: "JPY", label: "Japanese Yen (¥)" },
  { value: "AUD", label: "Australian Dollar (A$)" },
] as const;

export type CurrencyCode = (typeof currencies)[number]["value"];

export const currencyCodes = currencies.map((c) => c.value) as [
  CurrencyCode,
  ...CurrencyCode[],
];

/** Round to 2 decimal places, avoiding binary float artefacts like 0.1 + 0.2. */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

const formatters = new Map<string, Intl.NumberFormat>();

/**
 * Formats an amount with its currency symbol, e.g. "₹1,234.50" or "¥1,200".
 * A fixed locale keeps server-rendered and client-rendered output identical.
 */
export function formatMoney(amount: number, currency: string = BASE_CURRENCY) {
  let formatter = formatters.get(currency);
  if (!formatter) {
    try {
      formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        currencyDisplay: "narrowSymbol",
      });
    } catch {
      formatter = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 });
    }
    formatters.set(currency, formatter);
  }
  return formatter.format(amount);
}

/** Just the symbol for a currency, used as an input adornment. */
export function currencySymbol(currency: string): string {
  const part = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  })
    .formatToParts(0)
    .find((p) => p.type === "currency");
  return part?.value ?? currency;
}
