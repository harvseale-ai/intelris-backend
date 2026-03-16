import { API_ROUTES } from '@common/constants/api-routes.constants';
import { IHttpClient } from '@common/http-client';
import { PublicationResDto } from '@modules/publications/dto/res/publication.res.dto';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ApiService {
  constructor(
    @Inject('IHttpClient')
    private readonly httpClient: IHttpClient,
  ) {}

  private async paginate<T>(
    url: string,
    buildParams: (page: number, take: number) => Record<string, any>,
    maxPages = 10,
    take = 50,
  ): Promise<T[]> {
    const result: T[] = [];

    for (let page = 0; page < maxPages; page++) {
      const skip = page * take;

      const data = await this.httpClient.get<{ items: T[] }>(url, buildParams(skip, take));

      const items = data.items ?? [];

      result.push(...items);

      if (!items.length) break;
    }

    return result;
  }

  async getRecentPublicationsWithinHour(maxPages = 10, take = 50): Promise<PublicationResDto[]> {
    const startDate = new Date(Date.now() - 1000 * 60 * 60 * 100).toISOString();
    const endDate = new Date().toISOString();

    const items = await this.paginate<PublicationResDto>(
      `${API_ROUTES.COMMITTEES.BASE_URL}${API_ROUTES.COMMITTEES.PUBLICATIONS}`,
      (page, take) => ({
        StartDate: startDate,
        EndDate: endDate,
        ShowOnWebsiteOnly: false,
        Skip: page * take,
        Take: take,
      }),
      maxPages,
      take,
    );

    return items;
  }
}
