export type CharacterListItem = {
  id: number;
  name: string;
  lastName?: string | null;
  race?: string | null;
  allowDraft?: boolean | null;
  currentProfessionName?: string | null;
};
