export interface Skill {
  id: number;
  name: string;
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
}

export interface ProfessionSkillAlternative {
  id: number;
  skill: Skill;
}

export interface ProfessionSkill {
  id: number;
  skill: Skill;
  alternativeSkill: ProfessionSkillAlternative[];
}

export interface ProfessionTalentAlternative {
  id: number;
  talent: Talent;
}

export interface ProfessionTalent {
  id: number;
  talent: Talent;
  alternativeTalent: ProfessionTalentAlternative[];
}

/**
 * Model frontendowy (camelCase). Backend zwraca snake_case, ale interceptor mapuje do camelCase.
 */
export interface Profession {
  id: number;
  name: string;
  description: string;

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
}
