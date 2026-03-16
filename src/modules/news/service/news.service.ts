import { API_ROUTES } from '@common/constants/api-routes.constants';
import { sanitize } from '@common/helpers/sanitize.helper';
import { ClassificationService } from '@modules/classification/service/classification.service';
import { CreateNewsDto } from '@modules/news/dto/req/create-news.dto';
import { ApiService } from '@modules/news/service/api.service';
import { GovUkResultItem } from '@modules/news/types/news.type';
import { OpenAIService } from '@modules/openai/openai.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);
  constructor(
    private apiService: ApiService,
    private openAIService: OpenAIService,
    private classificationService: ClassificationService,
  ) {}

  async syncNews(): Promise<CreateNewsDto[]> {
    try {
      const newsFromApi = await this.apiService.getGovUkNewsLast12h();
      const news: CreateNewsDto[] = await this.prepareNews(newsFromApi);

      return news;
    } catch (error) {
      this.logger.error('Error syncing news', error);
      throw new Error('Failed to sync news');
    }
  }

  private async prepareNews(apiData: GovUkResultItem[]): Promise<CreateNewsDto[]> {
    const allNews: CreateNewsDto[] = [];

    for (const news of apiData) {
      try {
        const title = sanitize(news.title);
        const description = sanitize(news.description);
        let descriptionForAi = description;

        const orgTitles = [...(news.organisations ?? []), ...(news.expanded_organisations ?? [])]
          .map((org) => org?.title?.trim())
          .filter(Boolean);

        if (orgTitles.length > 0) {
          descriptionForAi += ' ' + [...new Set(orgTitles)].join(' ');
        }

        const enriched = await this.enrichWithAI(title, descriptionForAi);

        const data: CreateNewsDto = {
          newsId: news._id,
          title,
          link: news.link ? API_ROUTES.NEWS.BASE_URL + sanitize(news.link) : '',
          description,
          summary: sanitize(enriched.summary ?? ''),
          public_timestamp: new Date(news.public_timestamp).toISOString(),
          topicIds: enriched.topicIds ?? [],
          sectorIds: enriched.sectorIds ?? [],
          regionIds: enriched.regionIds ?? [],
          departmentIds: enriched.departmentIds ?? [],
        };

        allNews.push(data);
      } catch (error) {
        this.logger.error(`Error processing news with ID ${news._id}`, error);
      }
    }

    return allNews;
  }

  private async enrichWithAI(title: string, description: string): Promise<Partial<CreateNewsDto>> {
    const classifications = await this.classificationService.findAll();

    try {
      const [classificationResult, summary] = await Promise.all([
        this.openAIService.generateNewsClassification(title, description, classifications),
        this.openAIService.generateNewsSummary(title, description),
      ]);

      return {
        topicIds: classificationResult.topicIds,
        sectorIds: classificationResult.sectionIds,
        regionIds: classificationResult.regionIds,
        departmentIds: classificationResult.departmentIds,
        summary,
      };
    } catch (error) {
      this.logger.error(`Error enriching news with AI for ${title}`, error);
      return {
        topicIds: [],
        sectorIds: [],
        regionIds: [],
        departmentIds: [],
        summary: '',
      };
    }
  }
}
