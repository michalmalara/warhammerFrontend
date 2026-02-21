export interface Item {
  id: number;
  name: string;
  description?: string | null;
  priceGc: number;
  priceSs: number;
  priceBp: number;
  weight: number;
}

export type CreateItemPayload = Omit<Item, 'id'>;
