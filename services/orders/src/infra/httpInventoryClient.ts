import { InventoryClient, ReserveResponse } from "../domain/orders";

export class HttpInventoryClient implements InventoryClient {
  constructor(private readonly baseUrl: string) {}

  async reserve(sku: string, quantity: number): Promise<ReserveResponse> {
    const res = await fetch(`${this.baseUrl}/inventory/reserve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sku, quantity }),
    });

    if (res.ok) {
      const body = (await res.json()) as { remaining: number };
      return { ok: true, remaining: body.remaining };
    }

    const body = (await res.json().catch(() => ({}))) as { error?: string };
    const reason = body.error;

    if (
      reason === "insufficient" ||
      reason === "unknown_sku" ||
      reason === "invalid_quantity"
    ) {
      return { ok: false, reason };
    }

    throw new Error(
      `inventory.reserve unexpected response: status=${res.status} body=${JSON.stringify(body)}`,
    );
  }
}
