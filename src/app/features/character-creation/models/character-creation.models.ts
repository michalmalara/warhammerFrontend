export type CharacterRace = 'human' | 'dwarf' | 'elf' | 'halfling';

export type CharacterCreationBio = {
  name: string;
  gender: 'male' | 'female' | 'other';
  age: number | null;
  starSign: string;
  eyeColor: string;
  hairColor: string;
  physicalMarkings: string;
};

export type CharacterCreationStep1 = {
  race: CharacterRace | null;
  bio: CharacterCreationBio;
};

export const DEFAULT_STEP_1: CharacterCreationStep1 = {
  race: null,
  bio: {
    name: '',
    gender: 'male',
    age: null,
    starSign: 'The Drummer',
    eyeColor: 'Hazel',
    hairColor: 'Ash Blonde',
    physicalMarkings: '',
  },
};
