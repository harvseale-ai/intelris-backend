import { CreatePetitionDto } from '@modules/petitions/dto/req/create-petition.dto';
import { PetitionsService } from '@modules/petitions/service/petitions.service';
import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { WpApiService } from '@common/wp-api/wp-api.service';
import { SWAGGER_TAG } from '../../common/constants/swaggerTags.constants';

@ApiTags(SWAGGER_TAG.PETITIONS)
@Controller('petitions')
export class PetitionsController {
  constructor(
    private readonly petitionsService: PetitionsService,
    private readonly wpApiService: WpApiService,
  ) {}

  @Post('sync')
  @ApiOperation({
    summary: 'Get petitions data for the latest 13 hours',
    description: 'Fetch petitions from the external source and AI-generated  tags, topics and summary.',
  })
  @ApiResponse({
    status: 200,
    description: 'Petitions  data successfully fetched and AI-generated tags, topics and summary provided',
    type: [CreatePetitionDto],
  })
  @ApiResponse({ status: 404, description: 'Petition not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async syncBills(): Promise<CreatePetitionDto[]> {
    const petitions = await this.petitionsService.syncPetitions();

    await this.wpApiService.post<void, { items: any[] }>('petitions/import', { items: petitions });

    return petitions as CreatePetitionDto[];
  }
}
