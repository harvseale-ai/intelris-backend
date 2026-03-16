import { API_ROUTES } from '@common/constants/api-routes.constants';
import { IHttpClient } from '@common/http-client';
import { PetitionsResDto } from '@modules/petitions/dto/res/petitions.res.dto';
import { PetitionsService } from '@modules/petitions/service/petitions.service';
import { Inject, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ApiService {
  constructor(
    @Inject('IHttpClient')
    private readonly httpClient: IHttpClient,
  ) {}

  private readonly logger = new Logger(PetitionsService.name);

  async getRecentPetitionsWithinHour(): Promise<PetitionsResDto[]> {
    const startDate = new Date(Date.now() - 1000 * 60 * 60 * 100).toISOString();

    try {
      const response = await this.httpClient.get<{ data: PetitionsResDto[] }>(
        `${API_ROUTES.PETITIONS.BASE_URL}${API_ROUTES.PETITIONS.PETITIONS}`,
        {
          state: API_ROUTES.PETITIONS.OPEN,
        },
      );

      const items = response.data ?? [];

      const filteredItems = items.filter(
        (item) => item.attributes.created_at >= startDate || item.attributes.government_response?.updated_at >= startDate,
      );

      return filteredItems;
    } catch (error) {
      this.logger.error('Error fetching recent petitions', error);
      return [];
    }
  }
}
