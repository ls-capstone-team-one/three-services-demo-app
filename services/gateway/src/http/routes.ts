import { Router, Response } from "express";
import { trace } from "@opentelemetry/api";
import { OrdersClient, UpstreamResponse } from "../domain/gateway";

async function proxy(
  res: Response,
  call: () => Promise<UpstreamResponse>,
): Promise<void> {
  const span = trace.getActiveSpan();
  try {
    const upstream = await call();
    span?.setAttributes({
      "upstream.reachable": true,
      "upstream.status": upstream.status,
    });
    res.status(upstream.status).json(upstream.body);
  } catch (err) {
    span?.setAttributes({
      "upstream.reachable": false,
    });
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

  router.get("/api/orders/:id", (req, res) => {
    trace.getActiveSpan()?.setAttributes({ "order.id": req.params.id });
    proxy(res, () => orders.getOrder(req.params.id));
  });

  return router;
}
