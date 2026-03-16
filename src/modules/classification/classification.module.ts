import { AxiosHttpClient } from '@common/http-client';
import { WpApiModule } from '@common/wp-api/wp-api.module';
import { Module } from '@nestjs/common';
import { ClassificationController } from './classification.controller';
import { ClassificationCronService } from './service/classification.cron.service';
import { ClassificationService } from './service/classification.service';

@Module({
  imports: [WpApiModule],
  controllers: [ClassificationController],
  providers: [
    ClassificationService,
    ClassificationCronService,
    {
      provide: 'IHttpClient',
      useClass: AxiosHttpClient,
    },
    AxiosHttpClient,
  ],
  exports: [ClassificationService],
})
export class ClassificationModule {}
