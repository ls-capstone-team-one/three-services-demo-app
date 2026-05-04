import express from "express";
import { HttpInventoryClient } from "./infra/httpInventoryClient";
import { buildRoutes } from "./http/routes";

const port = Number(process.env.PORT ?? 3002);
const inventoryUrl = process.env.INVENTORY_URL;
if (!inventoryUrl) {
  console.error("INVENTORY_URL is required");
  process.exit(1);
}

const inventoryTimeoutMs = Number(process.env.INVENTORY_TIMEOUT_MS ?? 5000);

const inventory = new HttpInventoryClient(inventoryUrl, inventoryTimeoutMs);

const app = express();
app.use(express.json());
app.use(buildRoutes(inventory));

const server = app.listen(port, () => {
  console.log(`orders listening on: ${port}`);
});

const SHUTDOWN_TIMEOUT_MS = 10000;
const shutdown = (signal: string) => {
  console.log(`received ${signal}, shutting down`);
  const timer = setTimeout(() => {
    console.error("shutdown timed out, forcing exit");
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS);
  server.close(() => {
    clearTimeout(timer);
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
