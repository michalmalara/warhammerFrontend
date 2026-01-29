export interface Armor {
  id: number;
  name: string;
  location: string;
  armorPoints: number;
}

export type CreateArmorPayload = Omit<Armor, 'id'>;
