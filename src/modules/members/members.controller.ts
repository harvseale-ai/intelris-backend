import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { WpApiService } from '@common/wp-api/wp-api.service';
import { SWAGGER_TAG } from '../../common/constants/swaggerTags.constants';
import { GetMemberAggregatedDto } from './dto/req/get-member-aggregated.dto';
import { MemberAggregatedDataDto } from './dto/res/member-aggregated.res.dto';
import { MembersForWPDto, MemberWPDto } from './dto/res/members-for-wp';
import { MembersApiService } from './service/members-api.service';
import { MembersNewsService } from './service/members-news.service';
import { MembersService } from './service/members.service';

@ApiTags(SWAGGER_TAG.MEMBERS)
@Controller('members')
export class MembersController {
  constructor(
    private readonly membersService: MembersService,
    private readonly membersApiService: MembersApiService,
    private readonly wpApiService: WpApiService,
    private readonly membersNewsService: MembersNewsService,
  ) {}

  @Post('generate-tags')
  @ApiOperation({
    summary: 'Get aggregated member data and AI-generated tags',
    description:
      'Fetch comprehensive member information including party affiliation, house membership, focus areas, experience, and committee roles',
  })
  @ApiResponse({
    status: 200,
    description: 'Member data successfully aggregated and AI-generated tags provided',
    type: MemberAggregatedDataDto,
  })
  @ApiResponse({ status: 404, description: 'Member not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getMemberAggregatedData(@Body() getMemberAggregatedDto: GetMemberAggregatedDto): Promise<MemberWPDto> {
    const member = await this.membersApiService.getMemberAggregatedData(getMemberAggregatedDto.memberId);

    const finalMembers: MembersForWPDto = {
      totalMembers: 1501,
      skip: 0,
      items: [member],
    };
    await this.wpApiService.post<void, { totalMembers: number; skip: number; items: any[] }>(
      'politicians/import',
      finalMembers,
    );

    return member;
  }

  @Post('fetch-all-with-ai')
  @ApiOperation({
    summary: 'Fetch all members with AI processing and upload to WordPress',
    description:
      'Fetches all members in pages of 15, processes with AI, saves to JSON file, and uploads to WordPress. Can resume from last processed page if interrupted.',
  })
  @ApiResponse({
    status: 200,
    description: 'Members processing completed successfully',
    type: MembersForWPDto,
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async fetchAllWithAI(): Promise<boolean> {
    await this.membersService.getMembersForWP();

    return true;
  }

  @Post('fetch-members-news')
  @ApiOperation({
    summary: 'Fetch members news',
    description: 'Fetch members news',
  })
  @ApiResponse({ status: 200, description: 'Members news fetched successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async fetchMembersNews(): Promise<any[]> {
    const [membersDiscussions, membersSpeeches] = await Promise.all([
      this.membersNewsService.syncMembersDiscussions(),
      this.membersNewsService.syncMembersSpeeches(),
    ]);

    const news = [...membersDiscussions, ...membersSpeeches];

    const body = {
      items: [...news],
    };

    await this.wpApiService.post<void, { items: any[] }>('politicians/news/import', body);

    return news;
  }
}
