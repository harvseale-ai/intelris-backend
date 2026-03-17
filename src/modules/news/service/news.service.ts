import { API_ROUTES } from '@common/constants/api-routes.constants';
import { sanitize } from '@common/helpers/sanitize.helper';
import { ClassificationService } from '@modules/classification/service/classification.service';
import { CreateNewsDto } from '@modules/news/dto/req/create-news.dto';
import { ApiService } from '@modules/news/service/api.service';
import { GovUkResultItem } from '@modules/news/types/news.type';
import { OpenAIService } from '@modules/openai/openai.service';
import { PrismaService } from '@modules/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { ClassificationType } from '@prisma/client';

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor(
    private apiService: ApiService,
    private openAIService: OpenAIService,
    private classificationService: ClassificationService,
    private prisma: PrismaService,
  ) {}

  async syncNews(): Promise<CreateNewsDto[]> {
    try {
      const newsFromApi = await this.apiService.getGovUkNewsLast12h();
      const news: CreateNewsDto[] = await this.prepareNews(newsFromApi);

      await this.saveNewsToNeon(news);

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

  private async saveNewsToNeon(items: CreateNewsDto[]): Promise<void> {
    this.logger.log(`Saving ${items.length} news items to Neon...`);

    for (const item of items) {
      const news = await this.prisma.news.upsert({
        where: { externalId: item.newsId },
        update: {
          title: item.title,
          description: item.description,
          summary: item.summary,
          publicTimestamp: item.public_timestamp,
          link: item.link || null,
        },
        create: {
          externalId: item.newsId,
          title: item.title,
          description: item.description,
          summary: item.summary,
          publicTimestamp: item.public_timestamp,
          link: item.link || null,
        },
      });

      await this.prisma.newsTopic.deleteMany({
        where: { newsId: news.id },
      });

      await this.prisma.newsSection.deleteMany({
        where: { newsId: news.id },
      });

      await this.prisma.newsRegion.deleteMany({
        where: { newsId: news.id },
      });

      await this.prisma.newsDepartment.deleteMany({
        where: { newsId: news.id },
      });

      if (item.topicIds?.length) {
        const topics = await this.prisma.classificationItem.findMany({
          where: {
            type: ClassificationType.TOPIC,
            externalId: { in: item.topicIds },
          },
        });

        if (topics.length) {
          await this.prisma.newsTopic.createMany({
            data: topics.map((topic) => ({
              newsId: news.id,
              classificationItemId: topic.id,
            })),
            skipDuplicates: true,
          });
        }
      }

      if (item.sectorIds?.length) {
        const sections = await this.prisma.classificationItem.findMany({
          where: {
            type: ClassificationType.SECTION,
            externalId: { in: item.sectorIds },
          },
        });

        if (sections.length) {
          await this.prisma.newsSection.createMany({
            data: sections.map((section) => ({
              newsId: news.id,
              classificationItemId: section.id,
            })),
            skipDuplicates: true,
          });
        }
      }

      if (item.regionIds?.length) {
        const regions = await this.prisma.classificationItem.findMany({
          where: {
            type: ClassificationType.REGION,
            externalId: { in: item.regionIds },
          },
        });

        if (regions.length) {
          await this.prisma.newsRegion.createMany({
            data: regions.map((region) => ({
              newsId: news.id,
              classificationItemId: region.id,
            })),
            skipDuplicates: true,
          });
        }
      }

      if (item.departmentIds?.length) {
        const departments = await this.prisma.classificationItem.findMany({
          where: {
            type: ClassificationType.DEPARTMENT,
            externalId: { in: item.departmentIds },
          },
        });

        if (departments.length) {
          await this.prisma.newsDepartment.createMany({
            data: departments.map((department) => ({
              newsId: news.id,
              classificationItemId: department.id,
            })),
            skipDuplicates: true,
          });
        }
      }
    }

    this.logger.log(`Finished saving news to Neon.`);
  }
}
