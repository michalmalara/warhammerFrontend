export interface Weapon {
  id: number;
  name: string;
  damage: number;
  damageBonus: number;
  range: number;
  reloadTime: number;
  type: string;
  description: string | null;
  traits: string | null;
  priceGc: number;
  priceSs: number;
  priceBp: number;
  weight: number;
}

export type CreateWeaponPayload = Omit<Weapon, 'id'>;
