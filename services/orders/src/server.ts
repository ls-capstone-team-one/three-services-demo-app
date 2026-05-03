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

const shutdown = (signal: string) => {
  console.log(`received ${signal}, shutting down`);
  server.close(() => process.exit(0));
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
