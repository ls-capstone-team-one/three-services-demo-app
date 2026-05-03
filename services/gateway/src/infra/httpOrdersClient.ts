import { OrdersClient, UpstreamResponse } from "../domain/gateway";

export class HttpOrdersClient implements OrdersClient {
  constructor(
    private readonly baseUrl: string,
    private readonly timeoutMs: number = 5000,
  ) {}

  async createOrder(body: unknown): Promise<UpstreamResponse> {
    const res = await fetch(`${this.baseUrl}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.timeoutMs),
    });
    return {
      status: res.status,
      body: await res.json().catch(() => null),
    };
  }

  async getOrder(id: string): Promise<UpstreamResponse> {
    const res = await fetch(
      `${this.baseUrl}/orders/${encodeURIComponent(id)}`,
      {
        method: "GET",
        signal: AbortSignal.timeout(this.timeoutMs),
      },
    );
    return {
      status: res.status,
      body: await res.json().catch(() => null),
    };
  }
}
