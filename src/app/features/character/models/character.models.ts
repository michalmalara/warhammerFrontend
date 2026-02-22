export type CharacterEquipmentCreateDto = {
  item: number;
  quality?: number;
  quantity?: number;
};

export type CharacterCreatePayload = {
  name: string;
  race: string;
  player?: number | null;
  isPC?: boolean;
  currentProfession?: number;
  careerPath?: number[];
  experiencePoints?: number;
  totalExperiencePoints?: number;
  currentProfessionName?: string | null;
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  eyes?: string | null;
  hair?: string | null;
  gender?: string | null;
  equipment?: CharacterEquipmentCreateDto[];
  weapons?: number[]; // CharacterWeapon IDs
  armor?: number[]; // CharacterArmor IDs
  goldCrowns?: number;
  silverShillings?: number;
  copperPennies?: number;
  characterProfile?: number; // CharacterProfile ID
  characterSkills?: number[]; // CharacterSkill IDs
  characterTalents?: number[]; // CharacterTalent IDs
};

export type Character = CharacterCreatePayload & {
  id: number;
};
