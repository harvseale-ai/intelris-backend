import { WpApiService } from '@common/wp-api/wp-api.service';
import { PublicationsService } from '@modules/publications/service/publications.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PublicationsCron {
  private readonly logger = new Logger(PublicationsCron.name);
  constructor(
    private readonly publicationsService: PublicationsService,
    private readonly wpApiService: WpApiService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  @Cron(CronExpression.EVERY_DAY_AT_9PM)
  async syncPublicationsAutomatically(): Promise<void> {
    this.logger.log('Starting scheduled publications sync (8am/8pm UTC)...');

    try {
      const publications = await this.publicationsService.syncPublications();

      const body = {
        items: [...publications],
      };
      await this.wpApiService.post<void, { items: any[] }>('news/import', body);

      this.logger.log(`Synced ${publications.length} publications.`);
    } catch (error) {
      this.logger.error('Failed to sync publications:', error);
    }
  }
}
