import { BASE_CURRENCY } from "@/lib/money";

/** Units of each currency per 1 BASE_CURRENCY, e.g. { USD: 0.012 }. */
export type ExchangeRates = Record<string, number>;

export interface RatesResult {
  rates: ExchangeRates;
  /** True when the live API was unavailable and fallback rates are in use. */
  stale: boolean;
}

// Approximate fallback used only if the API is unreachable.
const FALLBACK_RATES: ExchangeRates = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  JPY: 1.8,
  AUD: 0.018,
};

/**
 * Latest rates against BASE_CURRENCY. Fetched on the server so the API key
 * never reaches the browser, and cached for an hour across requests.
 */
export async function getExchangeRates(): Promise<RatesResult> {
  const key =
    process.env.EXCHANGE_RATES_API_KEY ??
    // Older deployments used a public variable name; still accepted on the server.
    process.env.NEXT_PUBLIC_EXCHANGE_RATES_KEY;
  if (!key) {
    console.warn("EXCHANGE_RATES_API_KEY is not set; using fallback rates.");
    return { rates: FALLBACK_RATES, stale: true };
  }
  try {
    const res = await fetch(
      `https://v6.exchangerate-api.com/v6/${key}/latest/${BASE_CURRENCY}`,
      { next: { revalidate: 3600 } },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rates = data?.conversion_rates as ExchangeRates | undefined;
    if (data?.result !== "success" || !rates?.[BASE_CURRENCY]) {
      throw new Error(
        `Unexpected response: ${data?.["error-type"] ?? "unknown"}`,
      );
    }
    return { rates, stale: false };
  } catch (e) {
    console.error("Failed to fetch exchange rates:", e);
    return { rates: FALLBACK_RATES, stale: true };
  }
}

/** The rate for one currency, guarding against missing or invalid values. */
export function rateFor(rates: ExchangeRates, currency: string): number {
  const rate = rates[currency] ?? FALLBACK_RATES[currency];
  if (!rate || !Number.isFinite(rate) || rate <= 0) {
    throw new Error(`No exchange rate available for ${currency}`);
  }
  return rate;
}
