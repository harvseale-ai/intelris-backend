import { IHttpClient } from '@common/http-client';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

function joinUrl(base: string, endpoint: string): string {
  const b = base.replace(/\/+$/, '');
  const e = endpoint.replace(/^\/+/, '');
  return `${b}/${e}`;
}

@Injectable()
export class WpApiService {
  private readonly logger = new Logger(WpApiService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(
    @Inject('IHttpClient') private readonly httpClient: IHttpClient,
    private readonly configService: ConfigService,
  ) {
    const rawBase = this.configService.getOrThrow<string>('wpApi.baseUrl');
    this.baseUrl = rawBase.replace(/\/+$/, '') + '/';
    this.apiKey = this.configService.getOrThrow<string>('wpApi.apiKey');
  }

  async get<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const url = joinUrl(this.baseUrl, endpoint);
    try {
      return await this.httpClient.get(url, params, {
        headers: { 'x-api-key': this.apiKey },
      });
    } catch (error) {
      this.logger.error(`GET ${endpoint} failed`, error);
      throw error;
    }
  }

  async post<T, B = any>(endpoint: string, body?: B): Promise<T> {
    const url = joinUrl(this.baseUrl, endpoint);
    try {
      return await this.httpClient.post<T>(url, body, {
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      this.logger.error(`POST ${endpoint} failed`, error);
      throw error;
    }
  }
}
