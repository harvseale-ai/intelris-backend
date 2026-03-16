import { Module } from '@nestjs/common';

import { WpApiModule } from '@common/wp-api/wp-api.module';
import { MembersCron } from '@modules/members/service/members.cron.service';
import { ClassificationModule } from '../classification/classification.module';
import { OpenAIService } from '../openai/openai.service';
import { MembersController } from './members.controller';
import { MembersApiService } from './service/members-api.service';
import { MembersMappingService } from './service/members-mapping.service';
import { MembersNewsApiService } from './service/members-news-api.service';
import { MembersNewsService } from './service/members-news.service';
import { MembersService } from './service/members.service';

@Module({
  imports: [WpApiModule, ClassificationModule],
  controllers: [MembersController],
  providers: [
    MembersService,
    MembersApiService,
    MembersMappingService,
    OpenAIService,
    MembersCron,
    MembersNewsApiService,
    MembersNewsService,
  ],
  exports: [MembersService, MembersApiService],
})
export class MembersModule {}
