import { WpApiService } from '@common/wp-api/wp-api.service';
import { PetitionsService } from '@modules/petitions/service/petitions.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class PetitionsCron {
  private readonly logger = new Logger(PetitionsCron.name);
  constructor(
    private readonly petitionsService: PetitionsService,
    private readonly wpApiService: WpApiService,
  ) {}

  @Cron('30 8 * * *')
  @Cron('30 20 * * *')
  async syncPetitionsAutomatically(): Promise<void> {
    this.logger.log('Starting scheduled petitions sync (08:30/20:30 UTC)...');

    try {
      const petitions = await this.petitionsService.syncPetitions();

      await this.wpApiService.post<void, { items: any[] }>('petitions/import', { items: petitions });

      this.logger.log(`Synced ${petitions.length} petitions.`);
    } catch (error) {
      this.logger.error('Failed to sync petitions:', error);
    }
  }
}
