import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { WpApiService } from '@common/wp-api/wp-api.service';
import { SWAGGER_TAG } from '../../common/constants/swaggerTags.constants';
import { CreateNewsDto } from './dto/req/create-news.dto';
import { NewsService } from './service/news.service';

@ApiTags(SWAGGER_TAG.NEWS)
@Controller('news')
export class NewsController {
  constructor(
    private readonly newsService: NewsService,
    private readonly wpApiService: WpApiService,
  ) {}

  @Post('sync')
  @ApiOperation({
    summary: 'Get news data for the latest 13 hours',
    description: 'Fetch news from the external source and AI-generated tags, topics and summary.',
  })
  @ApiResponse({
    status: 200,
    description: 'News data successfully fetched and AI-generated tags, topics and summary provided',
    type: [CreateNewsDto],
  })
  @ApiResponse({ status: 404, description: 'News not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async syncNews(): Promise<CreateNewsDto[]> {
    const news = await this.newsService.syncNews();
    const body = {
      items: [...news],
    };
    await this.wpApiService.post<void, { items: any[] }>('news/import', body);
    return news as CreateNewsDto[];
  }
}
