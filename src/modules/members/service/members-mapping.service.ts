import { Injectable } from '@nestjs/common';

import { ClassificationService } from '@modules/classification/service/classification.service';
import { OpenAIService } from '@modules/openai/openai.service';
import {
  CommitteeRoleDto,
  ExperienceDto,
  FocusAreaDto,
  HouseMembershipDto,
  PartyAffiliationDto,
} from '../dto/res/member-aggregated.res.dto';
import { MemberWPDto } from '../dto/res/members-for-wp';
import { ExternalCommittee } from '../types/external-committee.types';
import { ExternalExperience } from '../types/external-experience.types';
import { ExternalFocus } from '../types/external-focus.types';
import { ExternalMember, IMember } from '../types/external-member.types';

@Injectable()
export class MembersMappingService {
  constructor(
    private readonly classificationService: ClassificationService,
    private readonly openAIService: OpenAIService,
  ) {}

  async mapToMemberAggregatedData(data: {
    basicInfo: ExternalMember;
    focus: ExternalFocus;
    experience: ExternalExperience;
    committees: ExternalCommittee[];
  }): Promise<MemberWPDto> {
    const { basicInfo, focus, experience, committees } = data;
    const member = basicInfo.value;

    const politicianId = member.id;
    const nameDisplayAs = member.nameDisplayAs;
    const membershipFromId = member.latestHouseMembership?.membershipFromId;
    const membershipFrom = member.latestHouseMembership?.membershipFrom;
    const gender = member.gender;
    const nameFullTitle = member.nameFullTitle;
    const houseId = member.latestHouseMembership?.house;
    const membershipStartDate = member.latestHouseMembership?.membershipStartDate;
    const latestPartyId = member.latestParty?.id;
    const thumbnailUrl = member.thumbnailUrl;

    const aggregatedMember = {
      memberId: politicianId,
      name: nameFullTitle,
      displayAs: nameDisplayAs,
      photoUrl: thumbnailUrl,
      memberLocation: membershipFrom,
      partyAffiliation: this.mapPartyAffiliation(member.latestParty),
      houseMembership: this.mapHouseMembership(member.latestHouseMembership),
      focusAreas: this.mapFocusAreas(focus),
      experience: this.mapExperience(experience),
      committeeRoles: this.mapCommitteeRoles(committees),
    };

    let classifications = await this.classificationService.findAll();

    let classificationResult = { topicIds: [], sectionIds: [], regionIds: [], departmentIds: [] } as any;
    try {
      classificationResult = await this.openAIService.generateMemberClassification(aggregatedMember, classifications, {
        temperature: 0,
      });
    } catch (e) {
      classificationResult = { topicIds: [], sectionIds: [], regionIds: [], departmentIds: [] };
    }

    const memberData = {
      politicianId,
      nameDisplayAs,
      membershipFromId,
      membershipFrom,
      gender,
      nameFullTitle,
      houseId,
      membershipStartDate,
      latestPartyId,
      thumbnailUrl,
      topicIds: classificationResult.topicIds,
      sectorIds: classificationResult.sectionIds,
      regionIds: classificationResult.regionIds,
      departmentIds: classificationResult.departmentIds,
    } as IMember;

    return memberData;
  }

  private mapPartyAffiliation(party: any): PartyAffiliationDto {
    return {
      name: party.name,
      colour: party.backgroundColour,
    };
  }

  private mapHouseMembership(houseMembership: any): HouseMembershipDto {
    return {
      house: houseMembership.house === 1 ? 'Commons' : 'Lords',
      houseId: houseMembership.house,
    };
  }

  private mapFocusAreas(focus: any): FocusAreaDto[] {
    if (!focus?.value || !Array.isArray(focus.value)) {
      return [];
    }

    return focus.value.map((item: any) => ({
      category: item.category || '',
      focus: item.focus || '',
    }));
  }

  private mapExperience(experience: any): ExperienceDto[] {
    if (!experience?.value || !Array.isArray(experience.value)) {
      return [];
    }

    return experience.value.map((item: any) => ({
      type: item.type || '',
      title: item.title || '',
      organisation: item.organisation || '',
    }));
  }

  private mapCommitteeRoles(committees: any[]): CommitteeRoleDto[] {
    if (!Array.isArray(committees)) {
      return [];
    }

    const roles: CommitteeRoleDto[] = [];

    committees.forEach((memberCommittees) => {
      if (!memberCommittees.committees || !Array.isArray(memberCommittees.committees)) {
        return;
      }

      memberCommittees.committees.forEach((committee: any) => {
        if (!committee.roles || !Array.isArray(committee.roles)) {
          return;
        }

        committee.roles.forEach((role: any) => {
          const isActive = !role.endDate || new Date(role.endDate) > new Date();

          roles.push({
            role: role.role?.name || 'Unknown',
            committeeName: committee.name || 'Unknown Committee',
            committeeTypes: committee.committeeTypes?.map((type: any) => type.name) || [],
            startDate: role.startDate,
            endDate: role.endDate,
            isActive,
          });
        });
      });
    });

    return roles;
  }
}
