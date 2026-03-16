import { Config } from '@config/config.type';
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService<Config>) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const apiKey = req.headers['x-api-key'] || req.headers['X-API-KEY'];
    const validApiKey = this.configService.get('api')?.key;

    if (!apiKey || apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid or missing API key');
    }

    next();
  }
}
