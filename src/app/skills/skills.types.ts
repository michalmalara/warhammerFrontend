export type CharacteristicKey =
  | 'WS'
  | 'BS'
  | 'S'
  | 'T'
  | 'AG'
  | 'INT'
  | 'WP'
  | 'FEL'
  | string;

export interface SkillDefinition {
  id: string;
  name: string;
  characteristic: CharacteristicKey;
}

/**
 * Minimalny model UI dla komponentu Skills.
 * basePercent: wartość bazowa umiejętności (np. 29).
 */
export interface CharacterSkill {
  id: string;
  skill: SkillDefinition;
  basePercent: number;
  taken: boolean;
  advPlus10: boolean;
  advPlus20: boolean;
}

