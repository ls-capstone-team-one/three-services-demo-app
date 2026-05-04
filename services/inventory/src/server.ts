import express from "express";
import { InMemoryInventoryStore, seed } from "./infra/inventoryStore";
import { buildRoutes } from "./http/routes";

const port = Number(process.env.PORT ?? 3001);

const store = new InMemoryInventoryStore();
seed(store);

const app = express();
app.use(express.json());
app.use(buildRoutes(store));

const server = app.listen(port, () => {
  console.log(`inventory listening on: ${port}`);
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
