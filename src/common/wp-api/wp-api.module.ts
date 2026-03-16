import { AxiosHttpClient } from '@common/http-client';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { WpApiService } from './wp-api.service';

@Module({
  imports: [ConfigModule],
  providers: [
    WpApiService,
    {
      provide: 'IHttpClient',
      useClass: AxiosHttpClient,
    },
  ],
  exports: [WpApiService, 'IHttpClient'],
})
export class WpApiModule {}
