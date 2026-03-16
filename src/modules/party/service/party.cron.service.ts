import { PartyService } from '@modules/party/service/party.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class PartiesCron {
  private readonly logger = new Logger(PartiesCron.name);
  constructor(private readonly partyService: PartyService) {}

  @Cron(CronExpression.EVERY_6_MONTHS)
  async syncPartiesAutomatically(): Promise<void> {
    const saveDate = new Date();
    this.logger.log(`Starting scheduled Parties ${saveDate.toISOString()}`);

    try {
      const parties = await this.partyService.syncParties();

      this.logger.log(`Synced ${parties.length} parties.`);
    } catch (error) {
      this.logger.error('Failed to sync parties:', error);
    }
  }
}
