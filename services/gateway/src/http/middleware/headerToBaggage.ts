import { Request, Response, NextFunction } from "express";
import { propagation, context } from "@opentelemetry/api";

const HEADER_NAME = "x-fault-inject";
const BAGGAGE_KEY = "fault.inject";

export function headerToBaggage() {
  return (req: Request, _res: Response, next: NextFunction) => {
    const raw = req.header(HEADER_NAME);
    if (typeof raw !== "string" || raw.length === 0) return next();

    const current =
      propagation.getActiveBaggage() ?? propagation.createBaggage();
    const updated = current.setEntry(BAGGAGE_KEY, { value: raw });
    const newContext = propagation.setBaggage(context.active(), updated);

    context.with(newContext, () => next());
  };
}
