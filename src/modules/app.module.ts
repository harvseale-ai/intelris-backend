import { ApiKeyMiddleware } from '@common/middleware/api-key.middleware';
import { WpApiModule } from '@common/wp-api/wp-api.module';
import configuration from '@config/configs';
import { BillsModule } from '@modules/bills/bills.module';
import { MembersModule } from '@modules/members/members.module';
import { NewsModule } from '@modules/news/news.module';
import { OpenAIModule } from '@modules/openai/openai.module';
import { PartyModule } from '@modules/party/party.module';
import { PetitionsModule } from '@modules/petitions/petitions.module';
import { PrismaModule } from '@modules/prisma/prisma.module';
import { PublicationsModule } from '@modules/publications/publications.module';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ClassificationModule } from './classification/classification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [configuration],
      isGlobal: true,
    }),
    PrismaModule,
    OpenAIModule,
    ScheduleModule.forRoot(),
    NewsModule,
    BillsModule,
    PublicationsModule,
    PartyModule,
    MembersModule,
    PetitionsModule,
    ClassificationModule,
    WpApiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  constructor(private readonly configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiKeyMiddleware).forRoutes('/api/v1');
  }
}
