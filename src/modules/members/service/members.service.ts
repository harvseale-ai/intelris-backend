import { MembersForWPDto } from '@modules/members/dto/res/members-for-wp';
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';

import { WpApiService } from '@common/wp-api/wp-api.service';
import { PrismaService } from '@modules/prisma/prisma.service';
import { MembersProgress } from '../types/external-member.types';
import { MembersApiService } from './members-api.service';

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);

  constructor(
    private readonly membersApiService: MembersApiService,
    private readonly wpApiService: WpApiService,
    private readonly prisma: PrismaService,
  ) {}

  async getMembersForWP(): Promise<boolean> {
    try {
      let progress = this.loadProgress();

      if (!progress || progress.status === MembersProgress.COMPLETED) {
        progress = {
          totalMembers: 0,
          processedPages: 0,
          lastProcessedPage: 0,
          status: MembersProgress.IN_PROGRESS,
          items: [],
        };
        this.saveProgress(progress);
      }

      this.logger.log(`Starting/Resuming from page ${progress.lastProcessedPage + 1}`);

      const pageSize = 15;
      const firstPage = await this.membersApiService.fetchMembersPageRaw(0, 1);
      const totalMembers = firstPage.totalResults;
      const totalPages = Math.ceil(totalMembers / pageSize);

      progress.totalMembers = totalMembers;
      this.saveProgress(progress);

      this.logger.log(`Total members: ${totalMembers}, Total pages: ${totalPages}`);

      for (let page = progress.lastProcessedPage; page < totalPages; page++) {
        try {
          this.logger.log(`Processing page ${page + 1}/${totalPages}...`);

          const skip = page * pageSize;
          const pageData = await this.membersApiService.fetchMembersPageMapped(skip, pageSize);

          progress.items.push(...pageData);
          progress.processedPages++;
          progress.lastProcessedPage = page + 1;
          progress.status = MembersProgress.IN_PROGRESS;

          this.saveProgress(progress);

          this.logger.log(`Page ${page + 1} completed. Total processed: ${progress.items.length}`);
          await this.sleep(3000);
        } catch (error) {
          this.logger.error(`Error processing page ${page + 1}:`, error);
          await this.sleep(60000);

          page--;
          continue;
        }
      }

      progress.status = MembersProgress.COMPLETED;
      this.saveProgress(progress);

      const finalMembers: MembersForWPDto = {
        totalMembers: progress.items.length,
        skip: 0,
        items: progress.items,
      };

      this.logger.log(`All ${progress.items.length} members processed successfully`);

      await this.saveMembersToNeon(progress.items);

      await this.wpApiService.post<void, { totalMembers: number; skip: number; items: any[] }>(
        'politicians/import',
        finalMembers,
      );

      return true;
    } catch (error) {
      this.logger.error('Fatal error in fetchAllWithAI:', error);
      throw error;
    }
  }

  private async saveMembersToNeon(items: any[]): Promise<void> {
    this.logger.log(`Saving ${items.length} members to Neon...`);

    for (const item of items) {
      const politician = await this.prisma.politician.upsert({
        where: { politicianId: item.politicianId },
        update: {
          nameDisplayAs: item.nameDisplayAs,
          nameFullTitle: item.nameFullTitle,
          gender: item.gender ?? null,
          membershipFromId: item.membershipFromId ?? null,
          membershipFrom: item.membershipFrom ?? null,
          houseId: item.houseId ?? null,
          membershipStartDate: item.membershipStartDate
            ? new Date(item.membershipStartDate)
            : null,
          latestPartyId: item.latestPartyId ?? null,
          thumbnailUrl: item.thumbnailUrl ?? null,
        },
        create: {
          politicianId: item.politicianId,
          nameDisplayAs: item.nameDisplayAs,
          nameFullTitle: item.nameFullTitle,
          gender: item.gender ?? null,
          membershipFromId: item.membershipFromId ?? null,
          membershipFrom: item.membershipFrom ?? null,
          houseId: item.houseId ?? null,
          membershipStartDate: item.membershipStartDate
            ? new Date(item.membershipStartDate)
            : null,
          latestPartyId: item.latestPartyId ?? null,
          thumbnailUrl: item.thumbnailUrl ?? null,
        },
      });

      await this.prisma.politicianTopic.deleteMany({
        where: { politicianId: politician.id },
      });

      if (item.topicIds?.length) {
        const topics = await this.prisma.classificationItem.findMany({
          where: {
            type: 'TOPIC',
            externalId: { in: item.topicIds },
          },
        });

        if (topics.length) {
          await this.prisma.politicianTopic.createMany({
            data: topics.map((topic) => ({
              politicianId: politician.id,
              classificationItemId: topic.id,
            })),
            skipDuplicates: true,
          });
        }
      }
    }

    this.logger.log(`Finished saving members to Neon.`);
  }

  private loadProgress(): any {
    try {
      const data = fs.readFileSync('members.json', 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  private saveProgress(progress: any): void {
    fs.writeFileSync('members.json', JSON.stringify(progress, null, 2));
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
