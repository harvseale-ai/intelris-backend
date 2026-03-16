import { AxiosHttpClient } from '@common/http-client';
import { WpApiModule } from '@common/wp-api/wp-api.module';
import { ClassificationModule } from '@modules/classification/classification.module';
import { OpenAIService } from '@modules/openai/openai.service';
import { PartyModule } from '@modules/party/party.module';
import { PetitionsController } from '@modules/petitions/petitions.controller';
import { ApiService } from '@modules/petitions/service/api.service';
import { PetitionsCron } from '@modules/petitions/service/petitions.cron.service';
import { PetitionsService } from '@modules/petitions/service/petitions.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [PetitionsController],
  providers: [
    ApiService,
    OpenAIService,
    PetitionsCron,
    {
      provide: 'IHttpClient',
      useClass: AxiosHttpClient,
    },
    AxiosHttpClient,
    PetitionsService,
  ],
  imports: [PartyModule, ClassificationModule, WpApiModule],
})
export class PetitionsModule {}
