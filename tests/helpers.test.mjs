import { test } from "node:test";
import assert from "node:assert/strict";
import * as d from "@/lib/dates";
import * as m from "@/lib/money";

test("month bounds handle 31-day months, leap years and year ends", () => {
  assert.deepEqual(d.monthBounds("2026-10"), {
    start: "2026-10-01",
    end: "2026-10-31",
  });
  assert.deepEqual(d.monthBounds("2026-01"), {
    start: "2026-01-01",
    end: "2026-01-31",
  });
  assert.deepEqual(d.monthBounds("2028-02"), {
    start: "2028-02-01",
    end: "2028-02-29",
  });
  assert.equal(d.addMonths("2026-01", -1), "2025-12");
  assert.equal(d.addMonths("2026-12", 1), "2027-01");
});

test("calendar-date arithmetic never shifts by timezone", () => {
  assert.equal(d.addDays("2026-10-06", -6), "2026-09-30");
  assert.equal(d.addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(d.formatDate("2026-10-01"), "1 Oct 2026");
  assert.equal(d.formatMonth("2026-10"), "October 2026");
});

test("todayIn respects the timezone and rejects invalid ones", () => {
  assert.match(d.todayIn("Asia/Kolkata"), /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(d.todayIn("Pacific/Kiritimati") >= d.todayIn("Pacific/Pago_Pago"));
  assert.equal(d.todayIn("Not/AZone"), d.todayIn("UTC"));
  assert.equal(d.isMonthString("2026-13"), false);
});

test("money rounding and formatting", () => {
  assert.equal(m.roundMoney(0.1 + 0.2), 0.3);
  assert.equal(m.roundMoney(1.005), 1.01);
  assert.equal(m.formatMoney(1234.5, "INR"), "₹1,234.50");
  assert.equal(m.formatMoney(1200, "JPY"), "¥1,200");
  assert.equal(m.formatMoney(-5, "USD"), "-$5.00");
});
