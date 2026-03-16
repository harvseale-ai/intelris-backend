import { WpApiService } from '@common/wp-api/wp-api.service';
import { BillsService } from '@modules/bills/service/bills.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class BillCron {
  private readonly logger = new Logger(BillCron.name);
  constructor(
    private readonly billsService: BillsService,
    private readonly wpApiService: WpApiService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  @Cron(CronExpression.EVERY_DAY_AT_8PM)
  async syncBillsAutomatically(): Promise<void> {
    this.logger.log('Starting scheduled bills sync (8am/8pm UTC)...');

    try {
      const bills = await this.billsService.syncBills();

      const body = {
        items: [...bills],
      };

      await this.wpApiService.post<void, { items: any[] }>('bills/import', body);
      this.logger.log(`Synced ${bills.length} bills.`);
    } catch (error) {
      this.logger.error('Failed to sync bills:', error);
    }
  }
}
