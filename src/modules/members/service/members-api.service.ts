import { API_ROUTES } from '@common/constants/api-routes.constants';
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

import { MemberWPDto } from '../dto/res/members-for-wp';
import { ExternalCommittee } from '../types/external-committee.types';
import { ExternalExperience } from '../types/external-experience.types';
import { ExternalFocus } from '../types/external-focus.types';
import { ExternalMember, ExternalMemberItem, MembersSearchResponse } from '../types/external-member.types';
import { MembersMappingService } from './members-mapping.service';

@Injectable()
export class MembersApiService {
  private readonly logger = new Logger(MembersApiService.name);

  constructor(private readonly membersMappingService: MembersMappingService) {}

  async getMemberBasicInfo(memberId: number): Promise<ExternalMember> {
    const url = `${API_ROUTES.MEMBERS.BASE_URL}${API_ROUTES.MEMBERS.MEMBERS}/${memberId}`;
    const response = await axios.get(url);
    return response.data;
  }

  async getMemberFocus(memberId: number): Promise<ExternalFocus> {
    const url = `${API_ROUTES.MEMBERS.BASE_URL}${API_ROUTES.MEMBERS.MEMBERS}/${memberId}${API_ROUTES.MEMBERS.FOCUS}`;
    const response = await axios.get(url);
    return response.data;
  }

  async getMemberExperience(memberId: number): Promise<ExternalExperience> {
    const url = `${API_ROUTES.MEMBERS.BASE_URL}${API_ROUTES.MEMBERS.MEMBERS}/${memberId}${API_ROUTES.MEMBERS.EXPERIENCE}`;
    const response = await axios.get(url);
    return response.data;
  }

  async getMemberCommittees(memberId: number): Promise<ExternalCommittee[]> {
    const url = `${API_ROUTES.COMMITTEES.BASE_URL}${API_ROUTES.COMMITTEES.MEMBERS}`;
    const response = await axios.get(url, {
      params: {
        Members: memberId,
      },
    });
    return response.data;
  }

  async aggregateMemberData(memberId: number): Promise<{
    basicInfo: ExternalMember;
    focus: ExternalFocus;
    experience: ExternalExperience;
    committees: ExternalCommittee[];
  }> {
    const [basicInfo, focus, experience, committees] = await Promise.all([
      this.getMemberBasicInfo(memberId),
      this.getMemberFocus(memberId),
      this.getMemberExperience(memberId),
      this.getMemberCommittees(memberId),
    ]);

    return {
      basicInfo,
      focus,
      experience,
      committees,
    };
  }

  async fetchMembersPageRaw(skip: number, takeItems?: number): Promise<{ items: ExternalMemberItem[]; totalResults: number }> {
    const url = `${API_ROUTES.MEMBERS.BASE_URL}${API_ROUTES.MEMBERS.MEMBERS}/Search`;
    const take = takeItems || 15;
    const { data } = await axios.get<MembersSearchResponse>(url, {
      params: { IsCurrentMember: true, skip, take },
    });

    return data as unknown as { items: ExternalMemberItem[]; totalResults: number };
  }

  async fetchMembersPageMapped(skip: number, takeItems?: number): Promise<MemberWPDto[]> {
    const data = await this.fetchMembersPageRaw(skip, takeItems);

    const items = await Promise.all(
      data.items?.map(async (item) => {
        const memberId = (item as any).value?.id;
        return await this.getMemberAggregatedData(memberId);
      }),
    );

    return items as MemberWPDto[];
  }

  async getMemberAggregatedData(memberId: number): Promise<MemberWPDto> {
    const aggregated = await this.aggregateMemberData(memberId);
    const mapped = await this.membersMappingService.mapToMemberAggregatedData(aggregated);

    return mapped as MemberWPDto;
  }
}
