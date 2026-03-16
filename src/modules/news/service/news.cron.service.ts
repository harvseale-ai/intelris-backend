import { WpApiService } from '@common/wp-api/wp-api.service';
import { NewsService } from '@modules/news/service/news.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class NewsCron {
  private readonly logger = new Logger(NewsCron.name);
  constructor(
    private readonly newsService: NewsService,
    private readonly wpApiService: WpApiService,
  ) {}

  @Cron('15 8 * * *')
  @Cron('15 20 * * *')
  async syncNewsAutomatically(): Promise<void> {
    this.logger.log('Starting scheduled news sync (08:15/20:15 UTC)...');

    try {
      const news = await this.newsService.syncNews();

      const body = {
        items: [...news],
      };
      await this.wpApiService.post<void, { items: any[] }>('news/import', body);
      this.logger.log(`Synced ${news.length} news.`);
    } catch (error) {
      this.logger.error('Failed to sync news:', error);
    }
  }
}
