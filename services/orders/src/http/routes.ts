import { Router } from "express";
import { trace } from "@opentelemetry/api";
import {
  InventoryClient,
  Order,
  SyntheticOrderSummary,
  generateOrderId,
  pickOrderType,
} from "../domain/orders";

export function buildRoutes(inventory: InventoryClient): Router {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.status(200).send("ok");
  });

  router.post("/orders", async (req, res) => {
    const span = trace.getActiveSpan();
    const { sku, quantity } = req.body ?? {};

    if (typeof sku !== "string" || typeof quantity !== "number") {
      span?.setAttributes({
        "validation.ok": false,
        "validation.error": "missing_or_wrong_type",
      });
      res
        .status(400)
        .json({ error: "sku (string) and quantity (number) required" });
      return;
    }

    span?.setAttributes({
      sku,
      quantity_requested: quantity,
    });

    let reservation;
    try {
      reservation = await inventory.reserve(sku, quantity);
    } catch (err) {
      span?.setAttributes({
        "reservation.ok": false,
        "reservation.reason": "upstream_unavailable",
      });
      console.error("inventory upstream failed:", err);
      res.status(502).json({ error: "inventory_unavailable" });
      return;
    }

    if (!reservation.ok) {
      span?.setAttributes({
        "reservation.ok": false,
        "reservation.reason": reservation.reason,
      });
      const status =
        reservation.reason === "unknown_sku"
          ? 404
          : reservation.reason === "invalid_quantity"
            ? 400
            : 409;
      res.status(status).json({ error: reservation.reason });
      return;
    }

    const order: Order = {
      orderId: generateOrderId(),
      sku,
      quantity,
      type: pickOrderType(),
      status: "created",
    };
    span?.setAttributes({
      "reservation.ok": true,
      "inventory.stock.after": reservation.remaining,
      "order.id": order.orderId,
      "order.type": order.type,
      "order.status": order.status,
    });
    res.json(order);
  });

  router.get("/orders/:id", (req, res) => {
    const span = trace.getActiveSpan();
    const summary: SyntheticOrderSummary = {
      orderId: req.params.id,
      type: pickOrderType(),
      status: "completed",
    };
    span?.setAttributes({
      "order.id": summary.orderId,
      "order.type": summary.type,
      "order.status": summary.status,
    });
    res.json(summary);
  });

  return router;
}
