// Bodies are intentionally typed `unknown` — gateway is a proxy,
// not a translator. It forwards payloads to orders without
// inspecting their shape, staying decoupled from orders' schema.
// (JSON payloads are parsed by express.json() and re-serialized
// for the upstream call — this is a structural pass-through, not
// byte-perfect. If we ever need true raw forwarding, switch to
// express.raw().)
export type UpstreamResponse = {
  status: number;
  body: unknown;
};

export interface OrdersClient {
  createOrder(body: unknown): Promise<UpstreamResponse>;
  getOrder(id: string): Promise<UpstreamResponse>;
}
