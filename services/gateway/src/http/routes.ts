import { Router, Response } from "express";
import { OrdersClient, UpstreamResponse } from "../domain/gateway";

async function proxy(
  res: Response,
  call: () => Promise<UpstreamResponse>,
): Promise<void> {
  try {
    const upstream = await call();
    res.status(upstream.status).json(upstream.body);
  } catch (err) {
    console.error("orders upstream failed:", err);
    res.status(502).json({ error: "orders_unavailable" });
  }
}

export function buildRoutes(orders: OrdersClient): Router {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.status(200).send("ok");
  });

  router.post("/api/orders", (req, res) =>
    proxy(res, () => orders.createOrder(req.body)),
  );

  router.get("/api/orders/:id", (req, res) =>
    proxy(res, () => orders.getOrder(req.params.id)),
  );

  return router;
}
