import { Router } from "express";
import {
  InventoryClient,
  generateOrderId,
  pickOrderType,
} from "../domain/orders";

export function buildRoutes(inventory: InventoryClient): Router {
  const router = Router();

  router.get("/healthz", (_req, res) => {
    res.status(200).send("ok");
  });

  router.post("/orders", async (req, res) => {
    const { sku, quantity } = req.body ?? {};
    if (typeof sku !== "string" || typeof quantity !== "number") {
      res
        .status(400)
        .json({ error: "sku (string) and quantity (number) required" });
      return;
    }

    let reservation;
    try {
      reservation = await inventory.reserve(sku, quantity);
    } catch (err) {
      res
        .status(502)
        .json({ error: "inventory_unavailable", detail: String(err) });
      return;
    }

    if (!reservation.ok) {
      const status =
        reservation.reason === "unknown_sku"
          ? 404
          : reservation.reason === "invalid_quantity"
            ? 400
            : 409;
      res.status(status).json({ error: reservation.reason });
      return;
    }

    res.json({
      orderId: generateOrderId(),
      sku,
      quantity,
      type: pickOrderType(),
      status: "created",
    });
  });

  router.get("/orders/:id", (req, res) => {
    res.json({
      orderId: req.params.id,
      type: pickOrderType(),
      status: "completed",
    });
  });

  return router;
}
