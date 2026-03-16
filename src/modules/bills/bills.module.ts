import { AxiosHttpClient } from '@common/http-client';
import { WpApiModule } from '@common/wp-api/wp-api.module';
import { BillsController } from '@modules/bills/bills.controller';
import { ApiService } from '@modules/bills/service/api.service';
import { BillCron } from '@modules/bills/service/bills.cron.service';
import { BillsService } from '@modules/bills/service/bills.service';
import { ClassificationModule } from '@modules/classification/classification.module';
import { OpenAIService } from '@modules/openai/openai.service';
import { PartyModule } from '@modules/party/party.module';
import { Module } from '@nestjs/common';

@Module({
  controllers: [BillsController],
  providers: [
    BillsService,
    ApiService,
    OpenAIService,
    BillCron,
    {
      provide: 'IHttpClient',
      useClass: AxiosHttpClient,
    },
    AxiosHttpClient,
  ],
  imports: [PartyModule, ClassificationModule, WpApiModule],
})
export class BillsModule {}
