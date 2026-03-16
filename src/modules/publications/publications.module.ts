import { AxiosHttpClient } from '@common/http-client';
import { WpApiModule } from '@common/wp-api/wp-api.module';
import { ClassificationModule } from '@modules/classification/classification.module';
import { OpenAIService } from '@modules/openai/openai.service';
import { PublicationsController } from '@modules/publications/publications.controller';
import { ApiService } from '@modules/publications/service/api.service';
import { PublicationsCron } from '@modules/publications/service/publications.cron.service';
import { PublicationsService } from '@modules/publications/service/publications.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [PublicationsController],
  providers: [
    ApiService,
    OpenAIService,
    PublicationsCron,
    {
      provide: 'IHttpClient',
      useClass: AxiosHttpClient,
    },
    AxiosHttpClient,
    PublicationsService,
  ],
  imports: [ClassificationModule, WpApiModule],
})
export class PublicationsModule {}
