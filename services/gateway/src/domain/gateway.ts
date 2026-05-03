// Bodies are intentionally `unknown` — gateway is a proxy, not a
// translator. It forwards payloads verbatim and never parses them,
// so it stays decoupled from orders' schema.
export type UpstreamResponse = {
  status: number;
  body: unknown;
};

export interface OrdersClient {
  createOrder(body: unknown): Promise<UpstreamResponse>;
  getOrder(id: string): Promise<UpstreamResponse>;
}
