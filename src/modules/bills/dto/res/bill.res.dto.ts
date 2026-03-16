export class ExternalBillDto {
  billId: number;
  shortTitle: string;
  formerShortTitle?: string;
  currentHouse: string;
  originatingHouse: string;
  lastUpdate: string;
  billWithdrawn?: string;
  isDefeated: boolean;
  billTypeId: number;
  introducedSessionId: number;
  includedSessionIds: number[];
  isAct: boolean;
  currentStage: {
    id: number;
    stageId: number;
    sessionId: number;
    description: string;
    abbreviation: string;
    house: string;
    stageSittings: {
      id: number;
      stageId: number;
      billStageId: number;
      billId: number;
      date: string;
    }[];
    sortOrder: number;
  };
}

export interface ExternalBillFullDto {
  longTitle: string;
  summary: string | null;
  sponsors: {
    member: {
      memberId: number;
      name: string;
      party: string;
      partyColour: string;
      house: string;
      memberPhoto: string;
      memberPage: string;
      memberFrom: string;
    };
    organisation: {
      name: string;
      url: string;
    } | null;
    sortOrder: number;
  }[];
  promoters: {
    organisationName: string;
    organisationUrl: string;
  }[];
  petitioningPeriod: string | null;
  petitionInformation: string | null;
  agent: any | null;
  billId: number;
  shortTitle: string;
  formerShortTitle?: string | null;
  currentHouse: string;
  originatingHouse: string;
  lastUpdate: string;
  billWithdrawn?: string | null;
  isDefeated: boolean;
  billTypeId: number;
  introducedSessionId: number;
  includedSessionIds: number[];
  isAct: boolean;
  currentStage: {
    id: number;
    stageId: number;
    sessionId: number;
    description: string;
    abbreviation: string;
    house: string;
    stageSittings: {
      id: number;
      stageId: number;
      billStageId: number;
      billId: number;
      date: string;
    }[];
    sortOrder: number;
  };
}
