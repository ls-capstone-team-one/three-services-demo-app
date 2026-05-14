import { InventoryStore, StockLevel } from "../domain/inventory";

export class InMemoryInventoryStore implements InventoryStore {
  private data = new Map<string, StockLevel>();

  get(sku: string) {
    return this.data.get(sku);
  }

  put(stock: StockLevel) {
    this.data.set(stock.sku, stock);
  }

  list() {
    return [...this.data.values()];
  }
}

export function seed(store: InventoryStore): void {
  const seeds: StockLevel[] = [
    { sku: "SKU-A100", warehouse: "us-east", quantity: 100_000 },
    { sku: "SKU-B200", warehouse: "us-west", quantity: 50_000 },
    { sku: "SKU-C300", warehouse: "eu-central", quantity: 25_000 },
  ];

  for (const s of seeds) {
    store.put(s);
  }
}
