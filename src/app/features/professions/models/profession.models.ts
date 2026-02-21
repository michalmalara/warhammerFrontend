export interface Skill {
  id: number;
  name: string;
  description?: string;
  type?: string;
  associatedCharacteristic: string;
}

export interface Talent {
  id: number;
  name: string;
  description: string;
}

export interface ProfessionSummary {
  id: number;
  name: string;
  description: string;
  type: string;
}

export interface ProfessionSkillAlternative {
  id: number;
  skill: Skill;
  description?: string | null;
}

export interface ProfessionSkill {
  id: number;
  skill: Skill;
  description?: string | null;
  alternativeSkill: ProfessionSkillAlternative[];
}

export interface ProfessionTalentAlternative {
  id: number;
  talent: Talent;
  description?: string | null;
}

export interface ProfessionTalent {
  id: number;
  talent: Talent;
  description?: string | null;
  alternativeTalent: ProfessionTalentAlternative[];
}

export interface ProfessionWeapon {
  id: number;
  weapon: import('../../equipment/models/weapon.models').Weapon;
}

export interface ProfessionArmor {
  id: number;
  armor: import('../../equipment/models/armor.models').Armor;
}

export interface ProfessionEquipment {
  id: number;
  item: import('../../equipment/models/item.models').Item;
}

/**
 * Model frontendowy (camelCase). Backend zwraca snake_case, ale interceptor mapuje do camelCase.
 */
export interface Profession {
  id: number;
  name: string;
  description: string;
  type: string;

  weaponSkillsDevelopment: number;
  ballisticSkillsDevelopment: number;
  strengthDevelopment: number;
  toughnessDevelopment: number;
  agilityDevelopment: number;
  intelligenceDevelopment: number;
  willpowerDevelopment: number;
  fellowshipDevelopment: number;

  attacksDevelopment: number;
  woundsDevelopment: number;
  movementDevelopment: number;
  magicDevelopment: number;

  talents: ProfessionTalent[];
  skills: ProfessionSkill[];
  entryProfessions: ProfessionSummary[];
  exitProfessions: ProfessionSummary[];

  weapons?: ProfessionWeapon[];
  armors?: ProfessionArmor[];
  equipment?: ProfessionEquipment[];

  humanMinRoll?: number | null;
  humanMaxRoll?: number | null;
  dwarfMinRoll?: number | null;
  dwarfMaxRoll?: number | null;
  elfMinRoll?: number | null;
  elfMaxRoll?: number | null;
  halflingMinRoll?: number | null;
  halflingMaxRoll?: number | null;

  trappings?: string;
}

// Payload used when creating a Profession: backend expects lists of IDs for relations
export interface CreateProfessionPayload {
  name: string;
  description: string;
  type?: string;

  weaponSkillsDevelopment?: number;
  ballisticSkillsDevelopment?: number;
  strengthDevelopment?: number;
  toughnessDevelopment?: number;
  agilityDevelopment?: number;
  intelligenceDevelopment?: number;
  willpowerDevelopment?: number;
  fellowshipDevelopment?: number;

  attacksDevelopment?: number;
  woundsDevelopment?: number;
  movementDevelopment?: number;
  magicDevelopment?: number;

  talents?: number[]; // ProfessionTalent IDs
  skills?: number[]; // ProfessionSkill IDs
  entryProfessions?: number[]; // Profession IDs
  exitProfessions?: number[]; // Profession IDs

  weapons?: number[]; // ProfessionWeapon IDs
  armors?: number[]; // ProfessionArmor IDs
  equipment?: number[]; // ProfessionEquipment IDs

  humanMinRoll?: number | null;
  humanMaxRoll?: number | null;
  dwarfMinRoll?: number | null;
  dwarfMaxRoll?: number | null;
  elfMinRoll?: number | null;
  elfMaxRoll?: number | null;
  halflingMinRoll?: number | null;
  halflingMaxRoll?: number | null;

  trappings?: string;
}
