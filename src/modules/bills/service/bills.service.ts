import { House } from '@common/constants/houses.constants';
import { getHouseIdHelper } from '@common/helpers/getHouseId.helper';
import { sanitize } from '@common/helpers/sanitize.helper';
import { CreateBillDto } from '@modules/bills/dto/req/create-bill.dto';
import { ApiService } from '@modules/bills/service/api.service';
import { OpenAIService } from '@modules/openai/openai.service';
import { PartyService } from '@modules/party/service/party.service';
import { Injectable, Logger } from '@nestjs/common';

import { ClassificationService } from '@modules/classification/service/classification.service';
import { getBillTypeInfo } from '../utils/get-bill-type-info.utils';

const BILL_STAGE_IDS = [1, 6, 11, 27]; // 1 — initialized Commons, 6 - initialized Lords, 11 — Royal Assent, 27 -Failed Bills

@Injectable()
export class BillsService {
  private readonly logger = new Logger(BillsService.name);

  constructor(
    private apiService: ApiService,
    private openAIService: OpenAIService,
    private partyService: PartyService,
    private classificationService: ClassificationService,
  ) {}

  async syncBills(): Promise<CreateBillDto[]> {
    try {
      const billsFromApi = await this.apiService.getRecentBillsWithinHour(BILL_STAGE_IDS);
      const bills = await this.prepareBills(billsFromApi);

      return bills;
    } catch (error) {
      this.logger.error('Error syncing bills', error);
      throw new Error('Failed to sync bills');
    }
  }

  private async prepareBills(apiData: any[]): Promise<CreateBillDto[]> {
    const bills: CreateBillDto[] = [];

    for (const bill of apiData) {
      try {
        const billFullData = await this.apiService.getBillById(bill.billId);
        const party = billFullData.sponsors?.map((item) => item?.member?.party) ?? [];
        const memberIds = billFullData.sponsors?.map((item) => item?.member?.memberId) ?? [];
        const house = billFullData.originatingHouse?.toLowerCase() as House;
        const partyByHouse = party.length
          ? await this.partyService.findByName(party[0])
          : await this.partyService.findByHouse(house);
        const partyIds = Array.isArray(partyByHouse) ? partyByHouse : [partyByHouse];

        const titleForAI = billFullData.longTitle ?? bill.shortTitle ?? bill.formerShortTitle;
        const originatingHouseId = getHouseIdHelper(sanitize(bill.originatingHouse))[0];

        const enriched = await this.enrichWithAI(billFullData, titleForAI);

        const data: CreateBillDto = {
          billId: bill.billId,
          shortTitle: sanitize(bill.shortTitle),
          partyIds: partyIds.filter((id) => id != null),
          memberIds: memberIds.filter((id) => id != null),
          originatingHouseId,
          lastUpdate: new Date(bill.lastUpdate).toISOString(),
          currentStageId: bill.currentStage?.stageId ?? 0,
          topicIds: (enriched.topicIds ?? []).filter((id) => id != null),
          sectorIds: (enriched.sectorIds ?? []).filter((id) => id != null),
          regionIds: (enriched.regionIds ?? []).filter((id) => id != null),
          departmentIds: (enriched.departmentIds ?? []).filter((id) => id != null),
          summary: sanitize(enriched.summary ?? ''),
        };

        bills.push(data);
      } catch (error) {
        this.logger.error(`Error processing bill with ID ${bill.billId}`, error);
      }
    }

    return bills;
  }

  private async enrichWithAI(bill: any, title: string): Promise<Partial<CreateBillDto>> {
    const billTypeInfo = getBillTypeInfo(bill.billTypeId);
    const content = `${title}. 
    Bill Type: ${billTypeInfo.name} (${billTypeInfo.category}). 
    Current Stage: ${bill.currentStage?.description ?? 'Unknown'}. 
    Context: ${billTypeInfo.description}`;

    const currentStage = bill.currentStage?.description;
    const currentHouse = bill.currentHouse;

    const classifications = await this.classificationService.findAll();

    try {
      const [classificationResult, summary] = await Promise.all([
        this.openAIService.generateBillClassification(title, content, classifications, currentStage, currentHouse),
        this.openAIService.generateBillSummary(title, content, currentStage, currentHouse, billTypeInfo.name),
      ]);

      return {
        topicIds: classificationResult.topicIds,
        sectorIds: classificationResult.sectionIds,
        regionIds: classificationResult.regionIds,
        departmentIds: classificationResult.departmentIds,
        summary,
      };
    } catch (error) {
      this.logger.error(`Error enriching bill with AI for ID ${bill.billId}`, error);
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
