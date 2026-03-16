import { CreatePublicationDto } from '@modules/publications/dto/req/create-publication.dto';
import { PublicationsService } from '@modules/publications/service/publications.service';
import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { WpApiService } from '@common/wp-api/wp-api.service';
import { SWAGGER_TAG } from '../../common/constants/swaggerTags.constants';

@ApiTags(SWAGGER_TAG.PUBLICATIONS)
@Controller('publications')
export class PublicationsController {
  constructor(
    private readonly publicationsService: PublicationsService,
    private readonly wpApiService: WpApiService,
  ) {}

  @Post('sync')
  @ApiOperation({
    summary: 'Get publications data for the latest 13 hours',
    description: 'Fetch publications from the external source and AI-generated  tags, topics and summary.',
  })
  @ApiResponse({
    status: 200,
    description: 'Publications  data successfully fetched and AI-generated tags, topics and summary provided',
    type: [CreatePublicationDto],
  })
  @ApiResponse({ status: 404, description: 'Publications not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async syncBills(): Promise<CreatePublicationDto[]> {
    const publications = await this.publicationsService.syncPublications();
    const body = {
      items: [...publications],
    };

    await this.wpApiService.post<void, { items: any[] }>('news/import', body);

    return publications as CreatePublicationDto[];
  }
}
