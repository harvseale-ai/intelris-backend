export class PartyResDto {
  items: { value: PartyValue; links: PartyLink[] }[];
}

export interface PartyValue {
  id: number;
  name: string;
  abbreviation: string;
  backgroundColour: string;
  foregroundColour: string;
  isLordsMainParty: boolean;
  isLordsSpiritualParty: boolean;
  governmentType: number | null;
  isIndependentParty: boolean;
}

export interface PartyLink {
  rel: string;
  href: string;
  method: string;
}

export class PartyFromDBResDto {
  id: number;
  partyId: number;
  name: string;
  isCommons: boolean;
  isLords: boolean;
  isIndependent: boolean;
  createdAt: Date;
  updatedAt: Date;
}
