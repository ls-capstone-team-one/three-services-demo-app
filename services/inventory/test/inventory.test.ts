import { reserve } from "../src/domain/inventory";

describe("inventory.reserve", () => {
  test("reserves stock when quantity is available", () => {
    const result = reserve(
      { sku: "SKU-A", warehouse: "us-east", quantity: 10 },
      3,
    );
    expect(result).toEqual({
      ok: true,
      updated: { sku: "SKU-A", warehouse: "us-east", quantity: 7 },
    });
  });

  test("returns insufficient when quantity exceeds stock", () => {
    expect(
      reserve({ sku: "SKU-A", warehouse: "us-east", quantity: 2 }, 5),
    ).toEqual({ ok: false, reason: "insufficient" });
  });

  test("returns unknown_sku when stock is missing", () => {
    expect(reserve(undefined, 1)).toEqual({ ok: false, reason: "unknown_sku" });
  });

  test("returns invalid_quantity when quantity is negative", () => {
    expect(
      reserve({ sku: "SKU-A", warehouse: "us-east", quantity: 10 }, -3),
    ).toEqual({ ok: false, reason: "invalid_quantity" });
  });

  test("returns invalid_quantity when quantity is zero", () => {
    expect(
      reserve({ sku: "SKU-A", warehouse: "us-east", quantity: 10 }, 0),
    ).toEqual({ ok: false, reason: "invalid_quantity" });
  });

  test("returns invalid_quantity when quantity is not an integer", () => {
    expect(
      reserve({ sku: "SKU-A", warehouse: "us-east", quantity: 10 }, 1.5),
    ).toEqual({ ok: false, reason: "invalid_quantity" });
  });
});
