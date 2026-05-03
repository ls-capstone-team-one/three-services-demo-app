export type OrderType = "standard" | "express" | "bulk";

export type OrderRequest = {
  sku: string;
  quantity: number;
};

export type Order = {
  orderId: string;
  sku: string;
  quantity: number;
  type: OrderType;
  status: "created";
};

export type ReserveFailureReason =
  | "insufficient"
  | "unknown_sku"
  | "invalid_quantity";

export type ReserveResponse =
  | { ok: true; remaining: number }
  | { ok: false; reason: ReserveFailureReason };

export interface InventoryClient {
  reserve(sku: string, quantity: number): Promise<ReserveResponse>;
}

const ORDER_TYPES: readonly OrderType[] = [
  "standard",
  "express",
  "bulk",
] as const;

export function generateOrderId(now: () => number = Date.now): string {
  return `ord-${now()}`;
}

export function pickOrderType(random: () => number = Math.random): OrderType {
  return ORDER_TYPES[Math.floor(random() * ORDER_TYPES.length)];
}
