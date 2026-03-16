import { API_ROUTES } from '@common/constants/api-routes.constants';
import { IHttpClient } from '@common/http-client';
import { PartyResDto } from '@modules/party/dto/res/party.res.dto';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ApiService {
  constructor(
    @Inject('IHttpClient')
    private readonly httpClient: IHttpClient,
  ) {}

  async getParties(): Promise<{ commonResponse: PartyResDto['items']; lordResponse: PartyResDto['items'] }> {
    const urlCommon = `${API_ROUTES.MEMBERS.BASE_URL}${API_ROUTES.MEMBERS.PARTIES}/1`;
    const urlLord = `${API_ROUTES.MEMBERS.BASE_URL}${API_ROUTES.MEMBERS.PARTIES}/2`;

    try {
      const [commonResponse, lordResponse] = await Promise.all([
        this.httpClient.get<PartyResDto>(urlCommon),
        this.httpClient.get<PartyResDto>(urlLord),
      ]);
      return { commonResponse: commonResponse.items, lordResponse: lordResponse.items };
    } catch (error) {
      console.error('Failed to fetch parties:', error);
      return { commonResponse: [], lordResponse: [] };
    }
  }
}
