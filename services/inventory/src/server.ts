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

const shutdown = (signal: string) => {
  console.log(`received ${signal}, shutting down`);
  server.close(() => process.exit(0));
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
