export type StockLevel = {
  sku: string;
  warehouse: string;
  quantity: number;
};
export type ReserveResult =
  | { ok: true; updated: StockLevel }
  | { ok: false; reason: "insufficient" | "unknown_sku" | "invalid_quantity" };

export function reserve(
  stock: StockLevel | undefined,
  quantity: number,
): ReserveResult {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return { ok: false, reason: "invalid_quantity" };
  }
  if (!stock) return { ok: false, reason: "unknown_sku" };
  if (stock.quantity < quantity) return { ok: false, reason: "insufficient" };
  return {
    ok: true,
    updated: { ...stock, quantity: stock.quantity - quantity },
  };
}

export interface InventoryStore {
  get(sku: string): StockLevel | undefined;
  put(stock: StockLevel): void;
  list(): StockLevel[];
}
