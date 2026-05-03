import { generateOrderId, pickOrderType } from "../src/domain/orders";

describe("orders.generateOrderId", () => {
  test("formats as ord-<timestamp>-<suffix>", () => {
    expect(
      generateOrderId(
        () => 12345,
        () => "abc123",
      ),
    ).toBe("ord-12345-abc123");
  });
});

describe("orders.pickOrderType", () => {
  test("returns standard for random near 0", () => {
    expect(pickOrderType(() => 0)).toBe("standard");
  });

  test("returns express for random near 0.5", () => {
    expect(pickOrderType(() => 0.5)).toBe("express");
  });

  test("returns bulk for random near 1", () => {
    expect(pickOrderType(() => 0.99)).toBe("bulk");
  });
});
