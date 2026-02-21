// przeniesione 1:1 z app/skills

export type CharacteristicKey = 'WS' | 'BS' | 'S' | 'T' | 'AG' | 'INT' | 'WP' | 'FEL' | string;

export interface SkillDefinition {
  id: string;
  name: string;
  characteristic: CharacteristicKey;
  description?: string | null;
}

/**
 * Minimalny model UI dla komponentu Skills.
 * basePercent: wartość bazowa umiejętności (np. 29).
 */
export interface CharacterSkill {
  id: string;
  skill: SkillDefinition;
  description?: string | null;
  basePercent: number;
  taken: boolean;
  advPlus10: boolean;
  advPlus20: boolean;
}
