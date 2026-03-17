import { Module } from '@nestjs/common';

import { AxiosHttpClient } from '@common/http-client';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { PartyController } from './party.controller';
import { ApiService } from './service/api.service';
import { PartiesCron } from './service/party.cron.service';
import { PartyService } from './service/party.service';

@Module({
  imports: [PrismaModule],
  controllers: [PartyController],
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
