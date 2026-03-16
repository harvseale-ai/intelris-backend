import { API_ROUTES } from '@common/constants/api-routes.constants';
import { IHttpClient } from '@common/http-client';
import { Inject, Injectable, Logger } from '@nestjs/common';
import {
  IEarlyDayMotions,
  IEarlyDayMotionsResDto,
  IOralquestions,
  IOralquestionsResDto,
  IWrittenquestionsDto,
  IWrittenquestionsResDto,
  IWrittenStatementsDto,
  IWrittenStatementsResDto,
} from '../types/member-news.types';

@Injectable()
export class MembersNewsApiService {
  constructor(
    @Inject('IHttpClient')
    private readonly httpClient: IHttpClient,
  ) {}

  private readonly logger = new Logger(MembersNewsApiService.name);

  async getOralquestionsByDate(): Promise<IOralquestions[]> {
    const startDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString();
    const endDate = new Date(Date.now()).toISOString();
    const lastThirteenHours = new Date(Date.now() - 1000 * 60 * 60 * 13).toISOString();

    try {
      const response = await this.httpClient.get<IOralquestionsResDto>(
        `${API_ROUTES.MEMBERS_NEWS.BASE_URL_ORAL}${API_ROUTES.MEMBERS_NEWS.ORAL_QUESTIONS}`,
        {
          answeringDateEnd: endDate,
          answeringDateStart: startDate,
        },
      );

      const items = response.Response ?? [];

      // const filteredItems = items.filter(
      //   (item) => item.TabledWhen >= lastThirteenHours || item.AnsweringWhen >= lastThirteenHours,
      // );
      // return filteredItems;
      return items.slice(0, 5);
    } catch (error) {
      this.logger.error('Error fetching recent petitions', error);
      return [];
    }
  }

  async getEarlyDayMotionsByDate(): Promise<IEarlyDayMotions[]> {
    const startDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString();
    const endDate = new Date(Date.now()).toISOString();
    const lastThirteenHours = new Date(Date.now() - 1000 * 60 * 60 * 13).toISOString();

    try {
      const response = await this.httpClient.get<IEarlyDayMotionsResDto>(
        `${API_ROUTES.MEMBERS_NEWS.BASE_URL_ORAL}${API_ROUTES.MEMBERS_NEWS.EARLY_DAY_MOTIONS}`,
        {
          tabledStartDate: startDate,
          tabledEndDate: endDate,
        },
      );

      const items = response.Response ?? [];

      // const filteredItems = items.filter(
      //   (item) => item.StatusDate >= lastThirteenHours || item.DateTabled >= lastThirteenHours,
      // );
      // return filteredItems;
      return items.slice(0, 5);
    } catch (error) {
      this.logger.error('Error fetching recent petitions', error);
      return [];
    }
  }

  async getWrittenquestionsByDate(): Promise<IWrittenquestionsDto[]> {
    const startDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString();
    const endDate = new Date(Date.now()).toISOString();
    const lastThirteenHours = new Date(Date.now() - 1000 * 60 * 60 * 13).toISOString();

    try {
      const response = await this.httpClient.get<IWrittenquestionsResDto>(
        `${API_ROUTES.MEMBERS_NEWS.BASE_URL_WRITTEN_QUESTIONS}`,
        {
          tabledWhenFrom: startDate,
          tabledWhenTo: endDate,
        },
      );

      const items = response.results ?? [];

      // const filteredItems = items.filter(
      //   (item) =>
      //     item.value.dateTabled >= lastThirteenHours ||
      //     item.value?.dateForAnswer >= lastThirteenHours ||
      //     item.value?.dateAnswered >= lastThirteenHours,
      // );
      // return filteredItems;
      return items.slice(0, 5);
    } catch (error) {
      this.logger.error('Error fetching recent petitions', error);
      return [];
    }
  }

  async getWrittenStatementsByDate(): Promise<IWrittenStatementsDto[]> {
    const startDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString();
    const endDate = new Date(Date.now()).toISOString();
    const lastThirteenHours = new Date(Date.now() - 1000 * 60 * 60 * 13).toISOString();

    try {
      const response = await this.httpClient.get<IWrittenStatementsResDto>(
        `${API_ROUTES.MEMBERS_NEWS.BASE_URL_WRITTEN_STATEMENTS}`,
        {
          madeWhenFrom: startDate,
          madeWhenTo: endDate,
        },
      );

      const items = response.results ?? [];

      // const filteredItems = items.filter((item) => item.value.dateMade >= lastThirteenHours);
      // return filteredItems;
      return items.slice(0, 5);
    } catch (error) {
      this.logger.error('Error fetching recent petitions', error);
      return [];
    }
  }
}
