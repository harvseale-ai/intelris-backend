import { CustomCronExpression } from '@common/constants/custom-cron-expression.enum';
import { WpApiService } from '@common/wp-api/wp-api.service';
import { MembersService } from '@modules/members/service/members.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MembersNewsService } from './members-news.service';

@Injectable()
export class MembersCron {
  private readonly logger = new Logger(MembersCron.name);
  constructor(
    private readonly membersService: MembersService,
    private readonly membersNewsService: MembersNewsService,
    private readonly wpApiService: WpApiService,
  ) {}

  @Cron(CustomCronExpression.ONCE_A_YEAR_JAN_2ND)
  async syncPartiesAutomatically(): Promise<void> {
    const saveDate = new Date();
    this.logger.log(`Starting scheduled Members ${saveDate.toISOString()}`);

    try {
      await this.membersService.getMembersForWP();
    } catch (error) {
      this.logger.error('Failed to sync members:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  @Cron(CronExpression.EVERY_DAY_AT_7PM)
  async syncMembersNewsAutomatically(): Promise<void> {
    const saveDate = new Date();
    this.logger.log(`Starting scheduled Members news ${saveDate.toISOString()}`);

    try {
      const [membersDiscussions, membersSpeeches] = await Promise.all([
        this.membersNewsService.syncMembersDiscussions(),
        this.membersNewsService.syncMembersSpeeches(),
      ]);

      const news = [...membersDiscussions, ...membersSpeeches];

      const body = {
        items: [...news],
      };

      await this.wpApiService.post<void, { items: any[] }>('politicians/news/import', body);
    } catch (error) {
      this.logger.error('Failed to sync members news:', error);
    }
  }
}
