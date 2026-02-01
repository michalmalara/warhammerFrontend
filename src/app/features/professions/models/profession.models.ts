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

  trappings?: string;
}
