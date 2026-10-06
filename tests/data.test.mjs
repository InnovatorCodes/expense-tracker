import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { store } from "./support/fake-firestore.mjs";
import * as data from "@/lib/server/data";

const LIVE = {
  INR: 1,
  USD: 0.0125,
  EUR: 0.0108,
  GBP: 0.0094,
  JPY: 1.75,
  AUD: 0.0185,
};
let rates = LIVE;
globalThis.fetch = async () =>
  rates
    ? new Response(
        JSON.stringify({ result: "success", conversion_rates: rates }),
      )
    : new Response("down", { status: 503 });
process.env.EXCHANGE_RATES_API_KEY = "test";
console.error = () => {}; // the simulated outage logs on purpose

const ts = (iso) => ({ toDate: () => new Date(iso) });
let n = 0;
let user;

beforeEach(() => {
  rates = LIVE;
  user = `u${++n}`; // fresh user per test, since ensureUserMigrated is memoised
  // Legacy (pre-v2) shape: no baseAmount / exchangeRate, amount sometimes a string.
  store.set(`users/${user}`, { currentBalance: 12345 });
  store.set(`users/${user}/transactions/a`, {
    name: "Salary",
    amount: 50000,
    currency: "INR",
    type: "income",
    category: "Salary",
    date: "2026-10-01",
    createdAt: ts("2026-10-01T10:00:00Z"),
  });
  store.set(`users/${user}/transactions/b`, {
    name: "Hotel",
    amount: "100",
    currency: "USD",
    type: "expense",
    category: "Travel",
    date: "2026-10-03",
    createdAt: ts("2026-10-03T10:00:00Z"),
  });
  store.set(`users/${user}/transactions/c`, {
    name: "Lunch",
    amount: 250,
    currency: "INR",
    type: "expense",
    category: "Food",
    date: "2026-09-30",
    createdAt: ts("2026-09-30T10:00:00Z"),
  });
});

test("does not migrate with fallback rates, but balance is still computed", async () => {
  rates = null;
  assert.equal(await data.ensureUserMigrated(user), false);
  assert.equal(store.get(`users/${user}`).schemaVersion, undefined);
  assert.equal(await data.getBalance(user), 50000 - 250 - 8333.33);
});

test("migration freezes the base amount and rate, and the balance derives from it", async () => {
  assert.equal(await data.ensureUserMigrated(user), true);
  const b = store.get(`users/${user}/transactions/b`);
  assert.deepEqual(
    [b.amount, b.exchangeRate, b.baseAmount],
    [100, 0.0125, 8000],
  );
  assert.equal(store.get(`users/${user}`).schemaVersion, 2);
  assert.equal(await data.getBalance(user), 50000 - 250 - 8000);
});

test("historic values do not change when rates move later", async () => {
  await data.ensureUserMigrated(user);
  rates = { INR: 1, USD: 0.01 };
  const [b] = await data.getTransactionsInRange(
    user,
    "2026-10-03",
    "2026-10-03",
  );
  assert.equal(b.baseAmount, 8000);
  assert.equal(await data.getBalance(user), 50000 - 250 - 8000);
});

test("monthly summary, 7-day series and 'All' budget usage", async () => {
  const oct = await data.getTransactionsInRange(
    user,
    "2026-10-01",
    "2026-10-31",
  );
  assert.deepEqual(
    oct.map((t) => t.id),
    ["b", "a"],
  );
  const s = data.summarize(oct);
  assert.deepEqual(s, {
    income: 50000,
    expense: 8000,
    expenseByCategory: { Travel: 8000, All: 8000 },
  });

  const range = await data.getTransactionsInRange(
    user,
    "2026-09-30",
    "2026-10-06",
  );
  const week = data.dailyTotals(range, "2026-09-30", "2026-10-06");
  assert.equal(week.length, 7);
  assert.deepEqual(week[0], { date: "2026-09-30", income: 0, expense: 250 });

  store.set(`users/${user}/budgets/x`, {
    category: "All",
    amount: 10000,
    createdAt: ts("2026-10-01T00:00:00Z"),
  });
  store.set(`users/${user}`, {
    ...store.get(`users/${user}`),
    pinnedBudget: "x",
  });
  assert.equal(data.withUsage(await data.getPinnedBudget(user), s).spent, 8000);
});

test("a pinned budget that was deleted is treated as no pin", async () => {
  store.set(`users/${user}`, {
    ...store.get(`users/${user}`),
    pinnedBudget: "gone",
  });
  assert.equal(await data.getPinnedBudget(user), null);
});
