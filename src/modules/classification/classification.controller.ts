import { Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { SWAGGER_TAG } from '../../common/constants/swaggerTags.constants';
import { ClassificationResDto } from './dto/classification.res.dto';
import { ClassificationService } from './service/classification.service';

@ApiTags(SWAGGER_TAG.CLASSIFICATION)
@Controller('classification')
export class ClassificationController {
  constructor(private readonly classificationService: ClassificationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new classifications' })
  @ApiResponse({ status: 201, description: 'Classifications created successfully' })
  create() {
    return this.classificationService.syncFromWp();
  }

  @Get()
  @ApiOperation({ summary: 'Get all classification' })
  @ApiResponse({ status: 201, description: 'Classification retrieved successfully', type: [ClassificationResDto] })
  findAll(): Promise<{
    topics: ClassificationResDto[];
    sections: ClassificationResDto[];
    regions: ClassificationResDto[];
    departments: ClassificationResDto[];
  }> {
    return this.classificationService.findAll();
  }
}
