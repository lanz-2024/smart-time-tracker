import { describe, it, expect } from "vitest";
import {
  formatDuration,
  formatDurationVerbose,
  parseDuration,
  formatTimerDisplay,
  sumDurations,
} from "./duration";

describe("formatDuration", () => {
  it("formats seconds only", () => expect(formatDuration(45)).toBe("45s"));
  it("formats minutes and seconds", () => expect(formatDuration(90)).toBe("1m 30s"));
  it("formats hours and minutes", () => expect(formatDuration(3661)).toBe("1h 01m"));
  it("handles zero", () => expect(formatDuration(0)).toBe("0s"));
});

describe("formatDurationVerbose", () => {
  it("formats seconds", () => expect(formatDurationVerbose(1)).toBe("1 second"));
  it("formats plural seconds", () => expect(formatDurationVerbose(5)).toBe("5 seconds"));
  it("formats hours, minutes, seconds", () =>
    expect(formatDurationVerbose(3661)).toBe("1 hour, 1 minute, 1 second"));
  it("handles zero", () => expect(formatDurationVerbose(0)).toBe("0 seconds"));
});

describe("parseDuration", () => {
  it("parses hours, minutes, seconds", () => expect(parseDuration("1h 30m 45s")).toBe(5445));
  it("parses minutes only", () => expect(parseDuration("5m")).toBe(300));
  it("returns 0 for invalid input", () => expect(parseDuration("invalid")).toBe(0));
});

describe("formatTimerDisplay", () => {
  it("formats MM:SS below an hour", () => expect(formatTimerDisplay(90)).toBe("01:30"));
  it("formats H:MM:SS at or above an hour", () => expect(formatTimerDisplay(3661)).toBe("1:01:01"));
  it("pads single-digit seconds", () => expect(formatTimerDisplay(5)).toBe("00:05"));
});

describe("sumDurations", () => {
  it("sums an array of durations", () => expect(sumDurations([60, 120, 30])).toBe(210));
  it("returns 0 for empty array", () => expect(sumDurations([])).toBe(0));
});
