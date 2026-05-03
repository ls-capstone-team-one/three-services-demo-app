import express from "express";
import { HttpOrdersClient } from "./infra/httpOrdersClient";
import { buildRoutes } from "./http/routes";

const port = Number(process.env.PORT ?? 3000);
const ordersUrl = process.env.ORDERS_URL;
if (!ordersUrl) {
  console.error("ORDERS_URL is required");
  process.exit(1);
}

const ordersTimeoutMs = Number(process.env.ORDERS_TIMEOUT_MS ?? 5000);
const orders = new HttpOrdersClient(ordersUrl, ordersTimeoutMs);

const app = express();
app.use(express.json());
app.use(buildRoutes(orders));

const server = app.listen(port, () => {
  console.log(`gateway listening on: ${port}`);
});

const shutdown = (signal: string) => {
  console.log(`received ${signal}, shutting down`);
  server.close(() => process.exit(0));
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
