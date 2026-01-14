export type SkillCharacteristic =
  | 'WS'
  | 'BS'
  | 'S'
  | 'T'
  | 'AG'
  | 'INT'
  | 'WP'
  | 'FEL';

export const SKILL_CHARACTERISTICS: readonly SkillCharacteristic[] = [
  'WS',
  'BS',
  'S',
  'T',
  'AG',
  'INT',
  'WP',
  'FEL',
] as const;

export type SkillCharacteristicMeta = Readonly<{
  value: SkillCharacteristic;
  shortLabel: string;
  label: string;
}>;

export const SKILL_CHARACTERISTICS_META: readonly SkillCharacteristicMeta[] = [
  {value: 'WS', shortLabel: 'WS', label: 'Weapon'},
  {value: 'BS', shortLabel: 'BS', label: 'Ballistic'},
  {value: 'S', shortLabel: 'S', label: 'Strength'},
  {value: 'T', shortLabel: 'T', label: 'Toughness'},
  {value: 'AG', shortLabel: 'Ag', label: 'Agility'},
  {value: 'INT', shortLabel: 'Int', label: 'Intellect'},
  {value: 'WP', shortLabel: 'WP', label: 'Willpower'},
  {value: 'FEL', shortLabel: 'Fel', label: 'Fellowship'},
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
