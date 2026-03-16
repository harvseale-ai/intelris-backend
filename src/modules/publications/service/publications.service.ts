import { sanitize } from '@common/helpers/sanitize.helper';
import { ClassificationService } from '@modules/classification/service/classification.service';
import { OpenAIService } from '@modules/openai/openai.service';
import { CreatePublicationDto } from '@modules/publications/dto/req/create-publication.dto';
import { ApiService } from '@modules/publications/service/api.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PublicationsService {
  private readonly logger = new Logger(PublicationsService.name);

  constructor(
    private apiService: ApiService,
    private openAIService: OpenAIService,
    private classificationService: ClassificationService,
  ) {}

  async syncPublications(): Promise<CreatePublicationDto[]> {
    try {
      const publicationsFromApi = await this.apiService.getRecentPublicationsWithinHour();
      const publications = await this.preparePublications(publicationsFromApi);

      return publications;
    } catch (error) {
      this.logger.error('Error syncing publications', error);
      throw new Error('Failed to sync publications');
    }
  }

  private async preparePublications(apiData: any[]): Promise<CreatePublicationDto[]> {
    const publications: CreatePublicationDto[] = [];

    for (const publication of apiData) {
      try {
        const enriched = await this.enrichWithAI(publication);
        const title = sanitize(publication.description ?? '');
        const linkRaw = sanitize(publication.additionalContentUrl) || sanitize(publication.additionalContentUrl2) || '';
        const link = linkRaw || '';
        const publicTimestamp = publication.publicationStartDate
          ? new Date(publication.publicationStartDate).toISOString()
          : new Date().toISOString();

        if (!publication?.id || !title) {
          this.logger.warn(
            `Skipping publication due to missing required fields: id=${publication?.id}, title=${Boolean(title)}`,
          );
          continue;
        }

        const data: CreatePublicationDto = {
          newsId: String(publication.id),
          title,
          link,
          description: sanitize(publication.type?.description ?? ''),
          public_timestamp: publicTimestamp,
          topicIds: enriched.topicIds ?? [],
          sectorIds: enriched.sectorIds ?? [],
          regionIds: enriched.regionIds ?? [],
          departmentIds: enriched.departmentIds ?? [],
          summary: sanitize(enriched.summary ?? ''),
        };

        publications.push(data);
      } catch (error) {
        this.logger.error(`Error processing publication with ID ${publication?.id ?? 'unknown'}`, error);
      }
    }

    return publications;
  }

  private async enrichWithAI(publication: any): Promise<Partial<CreatePublicationDto>> {
    const title = publication.description ?? '';
    const publicationTypeInfo = {
      name: 'Publications',
      category: 'Public',
      description:
        publication.type.description ?? 'Publications are formal announcements or documents related to legislative activities.',
      priority: 'medium',
    };

    const content = `${title}.
    Publication Type: ${publicationTypeInfo.name} (${publicationTypeInfo.category}).
    Current Stage: ${publication.currentStage?.description ?? 'Unknown'}.
    Context: ${publicationTypeInfo.description}`;

    const currentStage = publication.type.name;
    const currentHouse = publication.committee.house;
    const classifications = await this.classificationService.findAll();

    try {
      const [classificationResult, summary] = await Promise.all([
        this.openAIService.generateBillClassification(title, content, classifications),
        this.openAIService.generateBillSummary(title, content, currentStage, currentHouse, publicationTypeInfo.name),
      ]);

      return {
        topicIds: classificationResult.topicIds,
        sectorIds: classificationResult.sectionIds,
        regionIds: classificationResult.regionIds,
        departmentIds: classificationResult.departmentIds,
        summary,
      };
    } catch (error) {
      this.logger.error(`Error enriching publication with AI for ID ${publication.publicationId}`, error);
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
