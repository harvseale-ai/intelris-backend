import { API_ROUTES } from '@common/constants/api-routes.constants';
import { IHttpClient } from '@common/http-client';
import { GovUkResultItem, GovUkSearchResponse } from '@modules/news/types/news.type';
import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

@Injectable()
export class ApiService {
  private readonly logger = new Logger(ApiService.name);

  constructor(
    @Inject('IHttpClient')
    private readonly httpClient: IHttpClient,
  ) {}

  private fmtUtc(d: Date): string {
    return d.toISOString().slice(0, 16).replace('T', ' ');
  }
  private TWELVE_HOURS_AGO(): { from: string; to: string } {
    const to = new Date();
    const from = new Date(to.getTime() - 12 * 60 * 60 * 1000);
    return { from: this.fmtUtc(from), to: this.fmtUtc(to) };
  }
  private toQs(params: URLSearchParams): string {
    return params.toString().replace(/\+/g, '%20').replace(/%3A/gi, ':').replace(/%2C/gi, ',');
  }

  async getGovUkNewsLast12h(
    countTotal = 250,
    windowUtc: { from: string; to: string } = this.TWELVE_HOURS_AGO(),
  ): Promise<GovUkResultItem[]> {
    const supergroups: Array<
      'news_and_communications' | 'services' | 'policy_and_engagement' | 'research_and_statistics' | 'transparency'
    > = ['news_and_communications', 'services', 'policy_and_engagement', 'research_and_statistics', 'transparency'];

    const params = new URLSearchParams();
    params.set('count', String(countTotal));
    params.set('order', '-public_timestamp');
    for (const sg of supergroups) params.append('filter_content_purpose_supergroup', sg);
    params.set('filter_public_timestamp', `from:${windowUtc.from},to:${windowUtc.to}`);
    params.set('c', String(Date.now()));

    const fullUrl = `${API_ROUTES.NEWS.BASE_URL}/api/search.json?${this.toQs(params)}`;
    try {
      const { results } = await this.httpClient.get<GovUkSearchResponse>(fullUrl);

      return this.dedupById(results ?? []);
    } catch (err) {
      const message = err instanceof Error ? `${err.name}: ${err.message}` : `NonError: ${JSON.stringify(err)}`;

      this.logger.error(
        `[getGovUkNewsLast12h] Failed: url="${fullUrl}", window="${windowUtc.from}..${windowUtc.to}". ${message}`,
        err instanceof Error ? err.stack : undefined,
      );

      throw new InternalServerErrorException('Failed to fetch GOV.UK news', {
        cause: err,
      });
    }
  }

  private dedupById(items: GovUkResultItem[]): GovUkResultItem[] {
    if (!Array.isArray(items) || items.length === 0) return [];

    const byId = new Map<string, GovUkResultItem>();
    const ts = (s?: string) => (s ? Date.parse(s) : 0);

    for (const it of items) {
      if (!it?._id) continue;
      const prev = byId.get(it._id);
      if (!prev || ts(prev.public_timestamp) < ts(it.public_timestamp)) {
        byId.set(it._id, it);
      }
    }

    return [...byId.values()].sort((a, b) => ts(b.public_timestamp) - ts(a.public_timestamp));
  }
}
