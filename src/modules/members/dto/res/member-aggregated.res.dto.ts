import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class PartyAffiliationDto {
  @ApiProperty({ example: 'Crossbench' })
  name: string;

  @ApiProperty({ example: 'C0C0C0' })
  colour: string;
}

export class HouseMembershipDto {
  @ApiProperty({ example: 'Lords' })
  house: string;

  @ApiProperty({ example: 2 })
  houseId: number;
}

export class FocusAreaDto {
  @ApiProperty({ example: 'Education' })
  category: string;

  @ApiProperty({ example: 'Higher Education Policy' })
  focus: string;
}

export class ExperienceDto {
  @ApiProperty({ example: 'Professional' })
  type: string;

  @ApiProperty({ example: 'Chief Executive' })
  title: string;

  @ApiProperty({ example: 'Welsh Rugby Union' })
  organisation: string;
}

export class CommitteeRoleDto {
  @ApiProperty({ example: 'Member' })
  role: string;

  @ApiProperty({ example: 'Education for 11–16 Year Olds Committee' })
  committeeName: string;

  @ApiProperty({ example: ['(HL) Investigative', '(HL) Committee Office'] })
  committeeTypes: string[];

  @ApiProperty({ example: '2024-01-24T00:00:00' })
  startDate: string;

  @ApiProperty({ example: '2024-09-16T00:00:00', required: false })
  endDate?: string;

  @ApiProperty({ example: true })
  isActive: boolean;
}

export class MemberAggregatedDataDto {
  @ApiProperty({ example: 3898 })
  memberId: number;

  @ApiProperty({ example: 'The Lord Aberdare' })
  name: string;

  @ApiProperty({ example: 'Hackney North and Stoke Newington' })
  memberLocation: string;

  @ApiProperty({ example: 'Lord Aberdare' })
  displayAs: string;

  @ApiProperty({ example: 'https://members-api.parliament.uk/api/Members/3898/Thumbnail' })
  photoUrl: string;

  @ApiProperty({ type: PartyAffiliationDto })
  partyAffiliation: PartyAffiliationDto;

  @ApiProperty({ type: HouseMembershipDto })
  houseMembership: HouseMembershipDto;

  @ApiProperty({ type: [FocusAreaDto] })
  focusAreas: FocusAreaDto[];

  @ApiProperty({ type: [ExperienceDto] })
  experience: ExperienceDto[];

  @ApiProperty({ type: [CommitteeRoleDto] })
  committeeRoles: CommitteeRoleDto[];

  @ApiProperty({ example: [10, 11] })
  @IsArray()
  topicIds: number[];

  @ApiProperty({ example: [10, 11] })
  @IsArray()
  sectorIds: number[];

  @ApiProperty({ example: [282] })
  @IsArray()
  regionIds: number[];

  @ApiProperty({ example: [238] })
  @IsArray()
  departmentIds: number[];
}
