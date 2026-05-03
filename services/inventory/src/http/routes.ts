import { Router } from "express";
import { reserve, InventoryStore } from "../domain/inventory";

export function buildRoutes(store: InventoryStore): Router {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.status(200).send("ok");
  });

  router.post("/inventory/reserve", (req, res) => {
    const { sku, quantity } = req.body ?? {};
    if (typeof sku !== "string" || typeof quantity !== "number") {
      res
        .status(400)
        .json({ error: "sku (string) and quantity (number) required" });

      return;
    }

    const result = reserve(store.get(sku), quantity);
    if (!result.ok) {
      const status =
        result.reason === "unknown_sku"
          ? 404
          : result.reason === "invalid_quantity"
            ? 400
            : 409;
      res.status(status).json({ error: result.reason });

      return;
    }

    store.put(result.updated);
    res.json({
      sku: result.updated.sku,
      warehouse: result.updated.warehouse,
      remaining: result.updated.quantity,
      status: "reserved",
    });
  });

  router.get("/inventory/check/:sku", (req, res) => {
    const stock = store.get(req.params.sku);
    if (!stock) {
      res.status(404).json({ error: "unknown_sku" });
      return;
    }
    res.json(stock);
  });

  return router;
}
