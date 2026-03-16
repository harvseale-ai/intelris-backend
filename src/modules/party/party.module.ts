import { AxiosHttpClient } from '@common/http-client';
import { ApiService } from '@modules/party/service/api.service';
import { PartiesCron } from '@modules/party/service/party.cron.service';
import { PartyService } from '@modules/party/service/party.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [],
  providers: [
    ApiService,
    PartiesCron,
    {
      provide: 'IHttpClient',
      useClass: AxiosHttpClient,
    },
    AxiosHttpClient,
    PartyService,
  ],
  exports: [PartyService],
})
export class PartyModule {}
