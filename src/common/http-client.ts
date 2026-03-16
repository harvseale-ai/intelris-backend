import { Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig } from 'axios';

export interface IHttpClient {
  get<T>(url: string, params?: Record<string, any>, config?: AxiosRequestConfig): Promise<T>;
  post<T, B = any>(url: string, body?: B, config?: AxiosRequestConfig): Promise<T>;
}

@Injectable()
export class AxiosHttpClient implements IHttpClient {
  async get<T>(url: string, params?: Record<string, any>, config?: AxiosRequestConfig): Promise<T> {
    const mergedConfig: AxiosRequestConfig = {
      ...(config || {}),
      params: {
        ...(config?.params || {}),
        ...(params || {}),
      },
    };

    const response = await axios.get<T>(url, mergedConfig);
    return response.data;
  }

  async post<T, B = any>(url: string, body?: B, config?: AxiosRequestConfig): Promise<T> {
    const response = await axios.post<T>(url, body ?? {}, config);
    return response.data;
  }
}
