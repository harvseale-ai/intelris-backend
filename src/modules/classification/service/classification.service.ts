import { WpApiService } from '@common/wp-api/wp-api.service';
import { PrismaService } from '@modules/prisma/prisma.service';

import { Injectable, Logger } from '@nestjs/common';
import { ClassificationType as PrismaClassificationType } from '@prisma/client';
import { ClassificationResDto } from '../dto/classification.res.dto';
import { ClassificationDto, ClassificationType as DtoClassificationType } from '../dto/create-classification.dto';

@Injectable()
export class ClassificationService {
  private readonly logger = new Logger(ClassificationService.name);

  constructor(
    private readonly wpApiService: WpApiService,
    private readonly prisma: PrismaService,
  ) {}

  async syncFromWp(): Promise<ClassificationDto[]> {
    try {
      const [topicsRes, sectorsRes, regionsRes, departmentsRes] = await Promise.allSettled([
        this.wpApiService.get<{ id: number; title: string; description: string }[]>('topics'),
        this.wpApiService.get<{ id: number; title: string; description: string }[]>('sectors'),
        this.wpApiService.get<{ id: number; title: string; description: string }[]>('regions'),
        this.wpApiService.get<{ id: number; title: string; description: string }[]>('departments'),
      ]);

      const topics = topicsRes.status === 'fulfilled' ? (topicsRes.value ?? []) : [];
      const sectors = sectorsRes.status === 'fulfilled' ? (sectorsRes.value ?? []) : [];
      const regions = regionsRes.status === 'fulfilled' ? (regionsRes.value ?? []) : [];
      const departments = departmentsRes.status === 'fulfilled' ? (departmentsRes.value ?? []) : [];

      await this.prisma.classificationItem.deleteMany();

      const allItems = [
        ...topics.map((t) => ({ ...t, type: PrismaClassificationType.TOPIC })),
        ...sectors.map((t) => ({ ...t, type: PrismaClassificationType.SECTION })),
        ...regions.map((t) => ({ ...t, type: PrismaClassificationType.REGION })),
        ...departments.map((t) => ({ ...t, type: PrismaClassificationType.DEPARTMENT })),
      ];

      await this.prisma.classificationItem.createMany({
        data: allItems.map((item) => ({
          externalId: item.id,
          type: item.type,
          title: item.title,
          description: item.description,
        })),
      });

      return allItems.map<ClassificationDto>((i) => ({
        externalId: i.id,
        type: i.type as DtoClassificationType,
        title: i.title,
        description: i.description,
      }));
    } catch (error) {
      this.logger.error('Failed to fetch and save topics:', error);
      throw error;
    }
  }

  async findAll(): Promise<{
    topics: ClassificationResDto[];
    sections: ClassificationResDto[];
    regions: ClassificationResDto[];
    departments: ClassificationResDto[];
  }> {
    const items = await this.prisma.classificationItem.findMany();

    const toRes = (x: (typeof items)[number]): ClassificationResDto => ({
      id: x.externalId,
      title: x.title,
      description: x.description,
    });

    return {
      topics: items.filter((i) => i.type === PrismaClassificationType.TOPIC).map(toRes),
      sections: items.filter((i) => i.type === PrismaClassificationType.SECTION).map(toRes),
      regions: items.filter((i) => i.type === PrismaClassificationType.REGION).map(toRes),
      departments: items.filter((i) => i.type === PrismaClassificationType.DEPARTMENT).map(toRes),
    };
  }
}
