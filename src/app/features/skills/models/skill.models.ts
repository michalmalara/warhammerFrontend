export const SKILL_CHARACTERISTICS = [
  'WS',
  'BS',
  'S',
  'T',
  'AG',
  'INT',
  'WP',
  'FEL',
] as const;

export type SkillCharacteristic = (typeof SKILL_CHARACTERISTICS)[number];

/**
 * Model frontendowy (camelCase). Backend zwraca snake_case, ale interceptor mapuje do camelCase.
 */
export interface Skill {
  id: number;
  name: string;
  /** odpowiada backendowemu `associated_characteristic` */
  associatedCharacteristic: SkillCharacteristic | string;
}

export interface CreateSkillPayload {
  name: string;
  associatedCharacteristic: SkillCharacteristic | string;
}
