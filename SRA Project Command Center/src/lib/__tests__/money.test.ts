import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  MAX_MONETARY,
  MONEY_OVERFLOW_MESSAGE,
  isWithinMonetaryRange,
  mapDbError,
} from "../money";

/**
 * Regression tests for numeric overflow on monetary IDR fields.
 *
 * Original bug: creating a project/contract with a value > numeric(18,2)
 * (max ~10^16) caused Postgres "numeric field overflow" with a generic
 * error message and no field name. After the migration to numeric(22,2)
 * and the addition of MAX_MONETARY / mapDbError, these inputs are caught
 * client-side, server-side (zod), and as a final safety net at the DB layer.
 */
describe("monetary range guard", () => {
  it("accepts realistic large IDR contract values", () => {
    // 100 trillion IDR — a very large public infrastructure contract
    expect(isWithinMonetaryRange(1e14)).toBe(true);
    // 1 quadrillion IDR
    expect(isWithinMonetaryRange(1e15)).toBe(true);
    // The previous breaking value (~10^17) is now safely within range
    expect(isWithinMonetaryRange(1e17)).toBe(true);
  });

  it("accepts boundary value (MAX_MONETARY)", () => {
    expect(isWithinMonetaryRange(MAX_MONETARY)).toBe(true);
  });

  it("rejects values above MAX_MONETARY", () => {
    expect(isWithinMonetaryRange(MAX_MONETARY * 2)).toBe(false);
    expect(isWithinMonetaryRange(1e25)).toBe(false);
  });

  it("rejects negative and non-finite values", () => {
    expect(isWithinMonetaryRange(-1)).toBe(false);
    expect(isWithinMonetaryRange(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isWithinMonetaryRange(Number.NaN)).toBe(false);
  });

  it("treats null/undefined as valid (optional field)", () => {
    expect(isWithinMonetaryRange(null)).toBe(true);
    expect(isWithinMonetaryRange(undefined)).toBe(true);
  });
});

describe("zod monetary schema (mirrors server validators)", () => {
  const money = z.number().nonnegative().max(MAX_MONETARY);

  it("accepts large valid contract values", () => {
    expect(money.safeParse(1e17).success).toBe(true);
    expect(money.safeParse(MAX_MONETARY).success).toBe(true);
  });

  it("rejects values above MAX_MONETARY before they reach the DB", () => {
    const res = money.safeParse(MAX_MONETARY * 10);
    expect(res.success).toBe(false);
  });

  it("rejects negative values", () => {
    expect(money.safeParse(-100).success).toBe(false);
  });
});

describe("mapDbError for numeric overflow", () => {
  it("converts raw Postgres overflow into user-friendly message with field name", () => {
    const pgErr = new Error("numeric field overflow");
    const mapped = mapDbError(pgErr, "contract_value");
    expect(mapped.message).toContain("contract_value");
    expect(mapped.message).toContain(MONEY_OVERFLOW_MESSAGE);
  });

  it("handles missing field label gracefully", () => {
    const mapped = mapDbError(new Error("numeric field overflow"));
    expect(mapped.message).toContain("terlalu besar");
  });

  it("passes through unrelated errors unchanged", () => {
    const orig = new Error("duplicate key violates unique constraint");
    const mapped = mapDbError(orig, "value");
    expect(mapped.message).toBe(orig.message);
  });

  it("handles non-Error inputs", () => {
    const mapped = mapDbError("some string error");
    expect(mapped).toBeInstanceOf(Error);
    expect(mapped.message).toBe("some string error");
  });
});