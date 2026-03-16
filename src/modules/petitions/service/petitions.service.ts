import { sanitize } from '@common/helpers/sanitize.helper';
import { ClassificationService } from '@modules/classification/service/classification.service';
import { OpenAIService } from '@modules/openai/openai.service';
import { CreatePetitionDto } from '@modules/petitions/dto/req/create-petition.dto';
import { ApiService } from '@modules/petitions/service/api.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PetitionsService {
  private readonly logger = new Logger(PetitionsService.name);

  constructor(
    private apiService: ApiService,
    private openAIService: OpenAIService,
    private classificationService: ClassificationService,
  ) {}

  async syncPetitions(): Promise<CreatePetitionDto[]> {
    try {
      const petitionsFromApi = await this.apiService.getRecentPetitionsWithinHour();
      const petitions = await this.preparePetitions(petitionsFromApi);

      return petitions;
    } catch (error) {
      this.logger.error('Error syncing petitions', error);
      throw new Error('Failed to sync petitions');
    }
  }

  private async preparePetitions(apiData: any[]): Promise<CreatePetitionDto[]> {
    const petitions: CreatePetitionDto[] = [];

    for (const petition of apiData) {
      try {
        const enriched = await this.enrichWithAI(petition);

        const data: CreatePetitionDto = {
          petitionId: petition.id,
          title: sanitize(petition.attributes?.action ?? ''),
          description: sanitize(petition.attributes?.additional_details || petition.attributes?.background || ''),
          summary: sanitize(enriched.summary ?? ''),
          topicIds: (enriched.topicIds ?? []).filter((id) => id != null),
          sectorIds: (enriched.sectorIds ?? []).filter((id) => id != null),
          regionIds: (enriched.regionIds ?? []).filter((id) => id != null),
          departmentIds: (enriched.departmentIds ?? []).filter((id) => id != null),
          debateVideoLink: petition.attributes?.debate?.video_url ? sanitize(petition.attributes.debate.video_url) : '',
          link: petition.attributes?.debate?.transcript_url ? sanitize(petition.attributes.debate.transcript_url) : '',
          departmentNames: (petition.attributes?.departments ?? [])
            .map((dep) => sanitize(dep.name))
            .filter((name) => name != null && name !== ''),
          createdAt: new Date(petition.attributes?.created_at ?? '').toISOString(),
          updatedAt: new Date(petition.attributes?.updated_at ?? '').toISOString(),
        };

        petitions.push(data);
      } catch (error) {
        this.logger.error(`Error processing petition with ID ${petition.petitionId}`, error);
      }
    }

    return petitions;
  }

  private async enrichWithAI(petition: any): Promise<Partial<CreatePetitionDto>> {
    const petitionBackground = sanitize(petition.attributes?.background ?? '');
    const additionalDetails = sanitize(petition.attributes?.additional_details ?? '');
    const governmentResDetails = sanitize(petition.attributes?.government_response?.details ?? '');

    const title = petition.attributes?.action ?? '';

    const petitionDescription =
      `${petitionBackground}. ${additionalDetails}. \n Government response : ${governmentResDetails}`.trim() || '';

    const petitionTypeInfo = {
      name: 'Petitions',
      category: 'Public',
      description: petitionDescription ?? 'Petitions are formal announcements or documents related to legislative activities.',
      priority: 'medium',
    };

    const content = `${title}.
    Petition Type: ${petitionTypeInfo.name} (${petitionTypeInfo.category}).
    Current Stage: ${petition.attributes?.state ?? 'Unknown'}.
    Context: ${petitionTypeInfo.description}`;

    const currentStage = sanitize(petition.attributes?.state ?? '');
    const currentHouse = 'Unknown';
    const classifications = await this.classificationService.findAll();

    try {
      const [classificationResult, summary] = await Promise.all([
        this.openAIService.generateBillClassification(title, content, classifications, currentStage, currentHouse),
        this.openAIService.generateBillSummary(title, content, currentStage, currentHouse, petitionTypeInfo.name),
      ]);

      return {
        topicIds: classificationResult.topicIds,
        sectorIds: classificationResult.sectionIds,
        regionIds: classificationResult.regionIds,
        departmentIds: classificationResult.departmentIds,
        summary,
      };
    } catch (error) {
      this.logger.error(`Error enriching petition with AI for ID ${petition.petitionId}`, error);
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
