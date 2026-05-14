import "./infra/telemetry";
import { shutdownTelemetry } from "./infra/telemetry";

const KNOWN_SKUS = ["SKU-A100", "SKU-B200", "SKU-C300"];
const UNKNOWN_SKU_RATE = 0.05; // ~5% organic noise so baseline isn't unrealistically clean

function readEnvInt(name: string, defaultValue: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === "") return defaultValue;
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) {
    console.error(
      `Invalid ${name}: ${JSON.stringify(raw)} (must be a positive integer)`,
    );
    process.exit(1);
  }
  return n;
}

const gatewayUrl = process.env.GATEWAY_URL;
if (!gatewayUrl) {
  console.error("GATEWAY_URL is required");
  process.exit(1);
}

const rps = readEnvInt("REQUESTS_PER_SECOND", 1);
const intervalMs = Math.max(1, Math.floor(1000 / rps));
const requestTimeoutMs = 10_000;

console.log(`loadgen targeting ${gatewayUrl} at ${rps} req/s`);

function postOrder(): void {
  const sku =
    Math.random() < UNKNOWN_SKU_RATE
      ? `widget-${Math.floor(Math.random() * 100)}`
      : KNOWN_SKUS[Math.floor(Math.random() * KNOWN_SKUS.length)];
  const quantity = Math.floor(Math.random() * 5) + 1;
  fetch(`${gatewayUrl}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sku, quantity }),
    signal: AbortSignal.timeout(requestTimeoutMs),
  }).then(
    () => undefined,
    (err: unknown) => {
      console.error(`POST error: ${(err as Error).message}`);
    },
  );
}

function getOrder(): void {
  const orderId = `ord-${Math.floor(Math.random() * 1000)}`;
  fetch(`${gatewayUrl}/api/orders/${orderId}`, {
    signal: AbortSignal.timeout(requestTimeoutMs),
  }).then(
    () => undefined,
    (err: unknown) => {
      console.error(`GET error: ${(err as Error).message}`);
    },
  );
}

const ticker = setInterval(() => {
  if (Math.random() < 0.7) {
    postOrder();
  } else {
    getOrder();
  }
}, intervalMs);

const SHUTDOWN_TIMEOUT_MS = 10_000;
const shutdown = (signal: string) => {
  console.log(`received ${signal}, shutting down`);
  clearInterval(ticker);
  const timer = setTimeout(() => {
    console.error("shutdown timed out, forcing exit");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  shutdownTelemetry()
    .then(() => {
      clearTimeout(timer);
      process.exit(0);
    })
    .catch((err: unknown) => {
      clearTimeout(timer);
      console.error(`shutdown error: ${(err as Error).message}`);
      process.exit(1);
    });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
