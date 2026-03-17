import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { SWAGGER_TAG } from '../../common/constants/swaggerTags.constants';
import { CreatePartyDto } from './dto/req/create-party.dto';
import { PartyService } from './service/party.service';

@ApiTags(SWAGGER_TAG.PARTY)
@Controller('party')
export class PartyController {
  constructor(private readonly partyService: PartyService) {}

  @Post('sync')
  @ApiOperation({
    summary: 'Sync parties from Parliament API',
    description: 'Fetches active parties for Commons and Lords and saves them to Neon.',
  })
  @ApiResponse({
    status: 200,
    description: 'Parties synced successfully',
    type: [CreatePartyDto],
  })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async syncParties(): Promise<CreatePartyDto[]> {
    return this.partyService.syncParties();
  }
}
