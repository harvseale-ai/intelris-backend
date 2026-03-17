import { AxiosHttpClient } from '@common/http-client';
import { WpApiModule } from '@common/wp-api/wp-api.module';
import { ClassificationModule } from '@modules/classification/classification.module';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { ApiService } from '@modules/news/service/api.service';
import { NewsCron } from '@modules/news/service/news.cron.service';
import { NewsService } from '@modules/news/service/news.service';
import { OpenAIService } from '@modules/openai/openai.service';
import { Module } from '@nestjs/common';
import { NewsController } from './news.controller';

@Module({
  providers: [
    NewsService,
    ApiService,
    OpenAIService,
    NewsCron,
    {
      provide: 'IHttpClient',
      useClass: AxiosHttpClient,
    },
    AxiosHttpClient,
  ],
  imports: [ClassificationModule, WpApiModule, PrismaModule],
  controllers: [NewsController],
})
export class NewsModule {}
