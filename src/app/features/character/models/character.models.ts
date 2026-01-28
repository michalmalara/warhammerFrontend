export type CharacterCreatePayload = {
  name: string;
  race: string;
  isPc?: boolean;
  currentProfession: number;
  careerPath?: number[];
  experiencePoints?: number;
  totalExperiencePoints?: number;
  currentProfessionName?: string | null;
  age?: number | null;
  height?: number | null;
  weight?: number | null;
  eyes?: string;
  hair?: string;
  gender?: string;
  equipment?: string;
  weapons?: number[];
  armor?: number[];
  goldCrowns?: number;
  silverShillings?: number;
  copperPennies?: number;
  characterProfile: number;
  characterSkills?: number[];
  characterTalents?: number[];
};

export type Character = CharacterCreatePayload & {
  id: number;
};
