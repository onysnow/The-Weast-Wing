import { describe, expect, it } from "vitest";
import { daysBetween, parseDate, siteToday, siteYear } from "./incident-stats";

/**
 * These exist because the counter's time zone changed. It used to be computed
 * in UTC, which rolled the number over at 7 or 8pm Eastern — the evening
 * before, for the entire audience. Nothing pinned that behaviour, so nothing
 * would have caught it changing back.
 */

/** A UTC instant, for feeding to the site-clock helpers. */
const at = (iso: string) => Date.parse(iso);

describe("parseDate", () => {
  it("reads a date-only string as UTC midnight", () => {
    expect(parseDate("2026-07-28")).toBe(Date.UTC(2026, 6, 28));
  });

  it("is not shifted by the machine's local time zone", () => {
    // The whole point: two machines in different zones must agree.
    expect(parseDate("2026-01-01")).toBe(Date.UTC(2026, 0, 1));
    expect(new Date(parseDate("2026-01-01")).getUTCDate()).toBe(1);
  });
});

describe("siteToday", () => {
  it("is still yesterday's date at 8pm Eastern", () => {
    // 2026-09-19T00:30Z is 2026-09-18 20:30 in New York (EDT, UTC-4).
    // The old UTC maths called this the 19th; the site should say the 18th.
    expect(siteToday(at("2026-09-19T00:30:00Z"))).toBe(parseDate("2026-09-18"));
  });

  it("rolls over at midnight Eastern, not midnight UTC", () => {
    // 03:59Z is 23:59 the previous day in New York; 04:01Z is 00:01.
    expect(siteToday(at("2026-09-19T03:59:00Z"))).toBe(parseDate("2026-09-18"));
    expect(siteToday(at("2026-09-19T04:01:00Z"))).toBe(parseDate("2026-09-19"));
  });

  it("follows the offset across the DST boundary", () => {
    // EST is UTC-5, so the rollover moves an hour later in winter.
    // 2026-01-15T04:59Z is 23:59 on the 14th in New York.
    expect(siteToday(at("2026-01-15T04:59:00Z"))).toBe(parseDate("2026-01-14"));
    expect(siteToday(at("2026-01-15T05:01:00Z"))).toBe(parseDate("2026-01-15"));
  });

  it("returns a UTC-midnight timestamp, comparable with parseDate", () => {
    const today = siteToday(at("2026-09-18T16:00:00Z"));
    expect(today % 86_400_000).toBe(0);
  });
});

describe("siteYear", () => {
  it("uses the Eastern calendar year at the new-year boundary", () => {
    // 2027-01-01T02:00Z is still 9pm on New Year's Eve in New York.
    expect(siteYear(at("2027-01-01T02:00:00Z"))).toBe(2026);
    expect(siteYear(at("2027-01-01T06:00:00Z"))).toBe(2027);
  });
});

describe("daysBetween", () => {
  it("counts whole days", () => {
    expect(daysBetween(parseDate("2026-09-01"), parseDate("2026-09-18"))).toBe(17);
  });

  it("is zero on the same day", () => {
    expect(daysBetween(parseDate("2026-09-18"), parseDate("2026-09-18"))).toBe(0);
  });

  it("never goes negative for a future incident date", () => {
    expect(daysBetween(parseDate("2026-12-25"), parseDate("2026-09-18"))).toBe(0);
  });

  it("counts across a DST change without gaining or losing a day", () => {
    // 1 March to 1 April 2026 spans the spring-forward. Both ends are UTC
    // midnights, so the answer must be exactly 31 regardless.
    expect(daysBetween(parseDate("2026-03-01"), parseDate("2026-04-01"))).toBe(31);
  });
});
