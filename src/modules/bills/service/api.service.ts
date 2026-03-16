import { API_ROUTES } from '@common/constants/api-routes.constants';
import { IHttpClient } from '@common/http-client';
import { ExternalBillDto, ExternalBillFullDto } from '@modules/bills/dto/res/bill.res.dto';
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
      const data = await this.httpClient.get<{ items: T[] }>(url, buildParams(page, take));

      const items = data.items ?? [];

      result.push(...items);

      if (!items.length) break;
    }

    return result;
  }

  async getRecentBillsWithinHour(stageIds: number[], maxPages = 10, take = 50): Promise<ExternalBillDto[]> {
    const thirteenHoursAgo = Date.now() - 1000 * 60 * 60 * 500;

    const result: ExternalBillDto[] = [];

    for (const stageId of stageIds) {
      const items = await this.paginate<ExternalBillDto>(
        `${API_ROUTES.PARLIAMENT.BASE_URL}${API_ROUTES.PARLIAMENT.BILLS}`,
        (page, take) => ({
          BillStage: stageId,
          SortOrder: 'DateUpdatedDescending',
          Skip: page * take,
          Take: take,
        }),
        maxPages,
        take,
      );

      result.push(...items.filter((bill) => new Date(bill.lastUpdate).getTime() >= thirteenHoursAgo));
    }

    return result;
  }

  async getBillById(billId: number): Promise<ExternalBillFullDto | null> {
    const url = `${API_ROUTES.PARLIAMENT.BASE_URL}${API_ROUTES.PARLIAMENT.BILLS}/${billId}`;

    try {
      const response = await this.httpClient.get<ExternalBillFullDto>(url);
      return response;
    } catch (error) {
      console.error(`Failed to fetch bill with ID ${billId}:`, error);
      return null;
    }
  }
}
