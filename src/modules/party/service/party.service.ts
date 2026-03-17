import { House } from '@common/constants/houses.constants';
import { sanitize } from '@common/helpers/sanitize.helper';
import { PartyResDto } from '@modules/party/dto/res/party.res.dto';
import { ApiService } from '@modules/party/service/api.service';
import { PrismaService } from '@modules/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { CreatePartyDto } from '../dto/req/create-party.dto';

@Injectable()
export class PartyService {
  private readonly logger = new Logger(PartyService.name);

  constructor(
    private prisma: PrismaService,
    private apiService: ApiService,
  ) {}

  async syncParties(): Promise<CreatePartyDto[]> {
  try {
    const partiesFromApi = await this.apiService.getParties();
    const parties = await this.prepareParties(partiesFromApi);

    for (const party of parties) {
      await this.prisma.party.upsert({
        where: { partyId: party.partyId },
        update: {
          name: party.name,
          isCommons: party.isCommons,
          isLords: party.isLords,
          isIndependent: party.isIndependent,
        },
        create: {
          partyId: party.partyId,
          name: party.name,
          isCommons: party.isCommons,
          isLords: party.isLords,
          isIndependent: party.isIndependent,
        },
      });
    }

    return parties;
  } catch (error) {
    this.logger.error('Error syncing parties', error);
    throw new Error('Failed to sync parties');
  }
}

  async findByHouse(house: House): Promise<number[]> {
    try {
      const parties = await this.prisma.party.findMany({
        where: {
          [house === House.COMMONS ? 'isCommons' : 'isLords']: true,
        },
        select: {
          partyId: true,
        },
      });

      return parties.map((party) => party.partyId);
    } catch (error) {
      this.logger?.error?.(`Failed to find parties by house: ${house}`, error);
      return [];
    }
  }

  async findByName(name: string): Promise<number | null> {
    try {
      const party = await this.prisma.party.findFirst({
        where: { name },
        select: { partyId: true },
      });

      return party?.partyId ?? null;
    } catch (error) {
      this.logger?.error?.(`Failed to find party by name: ${name}`, error);
      return null;
    }
  }

  private async prepareParties(apiData: {
    commonResponse: PartyResDto['items'];
    lordResponse: PartyResDto['items'];
  }): Promise<Prisma.PartyCreateManyInput[]> {
    const partiesMap = new Map<number, Prisma.PartyCreateManyInput>();

    for (const party of apiData.commonResponse) {
      const { id, name, isIndependentParty } = party.value;
      partiesMap.set(id, {
        partyId: id,
        name: sanitize(name),
        isCommons: true,
        isLords: false,
        isIndependent: isIndependentParty,
      });
    }

    for (const party of apiData.lordResponse) {
      const { id, name, isIndependentParty } = party.value;

      if (partiesMap.has(id)) {
        const existing = partiesMap.get(id)!;
        existing.isLords = true;
        partiesMap.set(id, existing);
      } else {
        partiesMap.set(id, {
          partyId: id,
          name: sanitize(name),
          isCommons: false,
          isLords: true,
          isIndependent: isIndependentParty,
        });
      }
    }

    return Array.from(partiesMap.values());
  }
}
