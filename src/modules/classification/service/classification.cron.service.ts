import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ClassificationService } from './classification.service';

@Injectable()
export class ClassificationCronService {
  private readonly logger = new Logger(ClassificationCronService.name);
  constructor(private readonly classificationService: ClassificationService) {}

  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  @Cron(CronExpression.EVERY_DAY_AT_7PM)
  async syncClassificationsAutomatically(): Promise<void> {
    this.logger.log('Starting scheduled classifications sync (7am/7pm UTC)...');

    try {
      const classifications = await this.classificationService.syncFromWp();

      this.logger.log(`Synced ${classifications.length} classifications.`);
    } catch (error) {
      this.logger.error('Failed to sync classifications:', error);
    }
  }
}
