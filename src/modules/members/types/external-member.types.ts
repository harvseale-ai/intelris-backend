export interface ExternalMemberItem {
  id: number;
  nameListAs: string;
  nameDisplayAs: string;
  nameFullTitle: string;
  latestParty: {
    id: number;
    name: string;
    abbreviation: string;
    backgroundColour: string;
    foregroundColour: string;
    isLordsMainParty: boolean;
    isLordsSpiritualParty: boolean;
    governmentType: number;
    isIndependentParty: boolean;
  };
  gender: string;
  latestHouseMembership: {
    membershipFrom: string;
    membershipFromId: number;
    house: number;
    membershipStartDate: string;
    membershipEndDate?: string;
    membershipEndReason?: string;
    membershipEndReasonId?: number;
  };
  thumbnailUrl: string;
}

export interface ExternalMember {
  value: ExternalMemberItem;
}

export interface IMember {
  politicianId: number;
  nameDisplayAs: string;
  membershipFromId: number;
  membershipFrom: string;
  gender: string;
  nameFullTitle: string;
  houseId: number;
  membershipStartDate: string;
  latestPartyId: number;
  thumbnailUrl: string;
}

export interface MembersSearchLink {
  rel: string;
  href: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

export interface PartyInfo {
  id: number;
  name: string;
  abbreviation: string;
  backgroundColour: string;
  foregroundColour: string;
  isLordsMainParty: boolean;
  isLordsSpiritualParty: boolean;
  governmentType: string | null;
  isIndependentParty: boolean;
}

export interface MembershipStatus {
  statusIsActive: boolean;
  statusDescription: string;
  statusNotes: string | null;
  statusId: number;
  status: number;
  statusStartDate: string;
}

export interface LatestHouseMembership {
  membershipFrom: string;
  membershipFromId: number;
  house: number;
  membershipStartDate: string;
  membershipEndDate: string | null;
  membershipEndReason: string | null;
  membershipEndReasonNotes: string | null;
  membershipEndReasonId: number | null;
  membershipStatus: MembershipStatus;
}

export interface MemberValue {
  id: number;
  nameListAs: string;
  nameDisplayAs: string;
  nameFullTitle: string;
  nameAddressAs: string;
  latestParty: PartyInfo;
  gender: string;
  latestHouseMembership: LatestHouseMembership;
  thumbnailUrl: string;
}

export interface MemberItem {
  value: MemberValue;
  links: MembersSearchLink[];
}

export interface MembersSearchResponse {
  items: MemberItem[];
  totalResults: number;
  resultContext: string;
  skip: number;
  take: number;
  links: MembersSearchLink[];
  resultType: string;
}

export enum MembersProgress {
  COMPLETED = 'completed',
  IN_PROGRESS = 'in_progress',
  READY = 'ready',
}
