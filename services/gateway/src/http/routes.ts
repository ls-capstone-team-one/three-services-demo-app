import { Router } from "express";
import { OrdersClient } from "../domain/gateway";

export function buildRoutes(orders: OrdersClient): Router {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.status(200).send("ok");
  });

  router.post("/api/orders", async (req, res) => {
    try {
      const upstream = await orders.createOrder(req.body);
      res.status(upstream.status).json(upstream.body);
    } catch (err) {
      console.error("orders upstream failed:", err);
      res
        .status(502)
        .json({ error: "orders_unavailable", detail: String(err) });
    }
  });

  router.get("/api/orders/:id", async (req, res) => {
    try {
      const upstream = await orders.getOrder(req.params.id);
      res.status(upstream.status).json(upstream.body);
    } catch (err) {
      console.error("orders upstream failed:", err);
      res
        .status(502)
        .json({ error: "orders_unavailable", detail: String(err) });
    }
  });

  return router;
}
