import { CreateBillDto } from '@modules/bills/dto/req/create-bill.dto';
import { BillsService } from '@modules/bills/service/bills.service';
import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { WpApiService } from '@common/wp-api/wp-api.service';
import { SWAGGER_TAG } from '../../common/constants/swaggerTags.constants';

@ApiTags(SWAGGER_TAG.BILLS)
@Controller('bills')
export class BillsController {
  constructor(
    private readonly billsService: BillsService,
    private readonly wpApiService: WpApiService,
  ) {}

  @Post('sync')
  @ApiOperation({
    summary: 'Get bills data for the latest 13 hours',
    description: 'Fetch bills from the external source and AI-generated  tags, topics and summary.',
  })
  @ApiResponse({
    status: 200,
    description: 'Bills  data successfully fetched and AI-generated tags, topics and summary provided',
    type: [CreateBillDto],
  })
  @ApiResponse({ status: 404, description: 'Bills not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async syncBills(): Promise<CreateBillDto[]> {
    const bills = await this.billsService.syncBills();

    const body = {
      items: [...bills],
    };

    await this.wpApiService.post<void, { items: any[] }>('bills/import', body);
    return bills as CreateBillDto[];
  }
}
