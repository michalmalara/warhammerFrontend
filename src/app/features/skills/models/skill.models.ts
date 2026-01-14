export type SkillCharacteristic =
  | 'weapon_skills'
  | 'ballistic_skills'
  | 'strength'
  | 'toughness'
  | 'agility'
  | 'intelligence'
  | 'willpower'
  | 'fellowship';

export const SKILL_CHARACTERISTICS: readonly SkillCharacteristic[] = [
  'weapon_skills',
  'ballistic_skills',
  'strength',
  'toughness',
  'agility',
  'intelligence',
  'willpower',
  'fellowship',
] as const;

export type SkillCharacteristicMeta = Readonly<{
  value: SkillCharacteristic;
  shortLabel: string;
  label: string;
}>;

export const SKILL_CHARACTERISTICS_META: readonly SkillCharacteristicMeta[] = [
  {value: 'weapon_skills', shortLabel: 'WS', label: 'Weapon Skills'},
  {value: 'ballistic_skills', shortLabel: 'BS', label: 'Ballistic Skills'},
  {value: 'strength', shortLabel: 'S', label: 'Strength'},
  {value: 'toughness', shortLabel: 'T', label: 'Toughness'},
  {value: 'agility', shortLabel: 'Ag', label: 'Agility'},
  {value: 'intelligence', shortLabel: 'Int', label: 'Intelligence'},
  {value: 'willpower', shortLabel: 'WP', label: 'Willpower'},
  {value: 'fellowship', shortLabel: 'Fel', label: 'Fellowship'},
] as const;

export type SkillType = 'basic' | 'advanced';

export const SKILL_TYPES: ReadonlyArray<{ value: SkillType; label: string; icon: string }> = [
  {value: 'basic', label: 'Podstawowa', icon: 'school'},
  {value: 'advanced', label: 'Zaawansowana', icon: 'military_tech'},
] as const;

/**
 * Model frontendowy (camelCase). Backend zwraca snake_case, ale interceptor mapuje do camelCase.
 */
export interface Skill {
  id: number;
  name: string;
  type?: SkillType | string;
  /** odpowiada backendowemu `associated_characteristic` */
  associatedCharacteristic: SkillCharacteristic | string;
}

export interface CreateSkillPayload {
  name: string;
  type: SkillType;
  associatedCharacteristic: SkillCharacteristic | string;
}
