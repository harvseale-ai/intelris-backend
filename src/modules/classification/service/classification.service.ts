import { WpApiService } from '@common/wp-api/wp-api.service';
import { PrismaService } from '@modules/prisma/prisma.service';

import { Injectable, Logger } from '@nestjs/common';
import { ClassificationType as PrismaClassificationType } from '@prisma/client';
import { ClassificationResDto } from '../dto/classification.res.dto';
import {
  ClassificationDto,
  ClassificationType as DtoClassificationType,
} from '../dto/create-classification.dto';

type WpClassificationItem = {
  id: number;
  title: string;
  description?: string | null;
};

type NormalizedClassificationItem = {
  externalId: number;
  slug: string;
  type: PrismaClassificationType;
  title: string;
  description: string | null;
  sortOrder: number;
};

@Injectable()
export class ClassificationService {
  private readonly logger = new Logger(ClassificationService.name);

  constructor(
    private readonly wpApiService: WpApiService,
    private readonly prisma: PrismaService,
  ) {}

  private toSlug(type: PrismaClassificationType, id: number, title: string): string {
    const safeTitle = title
      .toLowerCase()
      .trim()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-');

    return `${type.toLowerCase()}-${id}-${safeTitle}`;
  }

  private normalizeItems(
    items: WpClassificationItem[],
    type: PrismaClassificationType,
  ): NormalizedClassificationItem[] {
    return items.map((item, index) => ({
      externalId: item.id,
      slug: this.toSlug(type, item.id, item.title),
      type,
      title: item.title.trim(),
      description: item.description?.trim() || null,
      sortOrder: index,
    }));
  }

  async syncFromWp(): Promise<ClassificationDto[]> {
    try {
      const [topicsRes, sectorsRes, regionsRes, departmentsRes] = await Promise.allSettled([
        this.wpApiService.get<WpClassificationItem[]>('topics'),
        this.wpApiService.get<WpClassificationItem[]>('sectors'),
        this.wpApiService.get<WpClassificationItem[]>('regions'),
        this.wpApiService.get<WpClassificationItem[]>('departments'),
      ]);

      const topics = topicsRes.status === 'fulfilled' ? (topicsRes.value ?? []) : [];
      const sectors = sectorsRes.status === 'fulfilled' ? (sectorsRes.value ?? []) : [];
      const regions = regionsRes.status === 'fulfilled' ? (regionsRes.value ?? []) : [];
      const departments = departmentsRes.status === 'fulfilled' ? (departmentsRes.value ?? []) : [];

      if (topicsRes.status === 'rejected') {
        this.logger.warn(`Failed to fetch topics: ${String(topicsRes.reason)}`);
      }
      if (sectorsRes.status === 'rejected') {
        this.logger.warn(`Failed to fetch sectors: ${String(sectorsRes.reason)}`);
      }
      if (regionsRes.status === 'rejected') {
        this.logger.warn(`Failed to fetch regions: ${String(regionsRes.reason)}`);
      }
      if (departmentsRes.status === 'rejected') {
        this.logger.warn(`Failed to fetch departments: ${String(departmentsRes.reason)}`);
      }

      const allItems: NormalizedClassificationItem[] = [
        ...this.normalizeItems(topics, PrismaClassificationType.TOPIC),
        ...this.normalizeItems(sectors, PrismaClassificationType.SECTION),
        ...this.normalizeItems(regions, PrismaClassificationType.REGION),
        ...this.normalizeItems(departments, PrismaClassificationType.DEPARTMENT),
      ];

      await this.prisma.$transaction(async (tx) => {
        for (const item of allItems) {
          await tx.classificationItem.upsert({
            where: {
              slug: item.slug,
            },
            create: {
              externalId: item.externalId,
              slug: item.slug,
              type: item.type,
              title: item.title,
              description: item.description,
              isActive: true,
              sortOrder: item.sortOrder,
            },
            update: {
              externalId: item.externalId,
              type: item.type,
              title: item.title,
              description: item.description,
              isActive: true,
              sortOrder: item.sortOrder,
            },
          });
        }

        const incomingSlugs = allItems.map((item) => item.slug);

        await tx.classificationItem.updateMany({
          where: {
            type: {
              in: [
                PrismaClassificationType.TOPIC,
                PrismaClassificationType.SECTION,
                PrismaClassificationType.REGION,
                PrismaClassificationType.DEPARTMENT,
              ],
            },
            slug: {
              notIn: incomingSlugs,
            },
          },
          data: {
            isActive: false,
          },
        });
      });

      this.logger.log(`Classification sync complete: ${allItems.length} items synced`);

      return allItems.map<ClassificationDto>((item) => ({
        externalId: item.externalId,
        type: item.type as DtoClassificationType,
        title: item.title,
        description: item.description ?? '',
      }));
    } catch (error) {
      this.logger.error('Failed to sync classifications from WordPress', error);
      throw error;
    }
  }

  async findAll(): Promise<{
    topics: ClassificationResDto[];
    sections: ClassificationResDto[];
    regions: ClassificationResDto[];
    departments: ClassificationResDto[];
  }> {
    const items = await this.prisma.classificationItem.findMany({
      where: {
        isActive: true,
      },
      orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }, { title: 'asc' }],
    });

    const toRes = (x: (typeof items)[number]): ClassificationResDto => ({
      id: x.id, // internal DB id for EntityClassification joins
      title: x.title,
      description: x.description ?? '',
    });

    return {
      topics: items.filter((i) => i.type === PrismaClassificationType.TOPIC).map(toRes),
      sections: items.filter((i) => i.type === PrismaClassificationType.SECTION).map(toRes),
      regions: items.filter((i) => i.type === PrismaClassificationType.REGION).map(toRes),
      departments: items.filter((i) => i.type === PrismaClassificationType.DEPARTMENT).map(toRes),
    };
  }
}
