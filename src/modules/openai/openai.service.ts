import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { z } from 'zod';

import { MemberNewsAction } from '@modules/members/types/member-news.types';
import { Config, OpenAIConfig } from '../../config/config.type';
import { MemberAggregatedDataDto } from '../members/dto/res/member-aggregated.res.dto';
import { AI_PROMPTS } from './constants/prompt.constants';
import {
  BillClassificationSchema,
  BillSummaryGenerationSchema,
  ImportantNewsSelectionSchema,
  MemberClassificationSchema,
  MembersNewsClassificationSchema,
  MembersNewsSummarySchema,
  NewsAnalysisSchema,
  NewsClassificationSchema,
  SummaryGenerationSchema,
} from './constants/prompt.schemas';

@Injectable()
export class OpenAIService {
  private readonly openaiConfig: OpenAIConfig;

  constructor(private configService: ConfigService<Config>) {
    this.openaiConfig = this.configService.get<OpenAIConfig>('openai');
  }

  async getStructuredOutput<T extends z.ZodType>(
    schema: T,
    prompt: string,
    temperature?: number,
    modelName?: string,
  ): Promise<z.infer<T>> {
    const model = new ChatOpenAI({
      temperature: temperature ?? this.openaiConfig.temperature,
      modelName: modelName ?? this.openaiConfig.model,
      apiKey: this.openaiConfig.apiKey,
    });

    const modelWithStructuredOutput = model.withStructuredOutput(schema);
    return await modelWithStructuredOutput.invoke(prompt);
  }

  async generateBillClassification(
    title: string,
    content: string,
    classifications: {
      topics: { id: number; title: string; description: string }[];
      sections: { id: number; title: string; description: string }[];
      regions: { id: number; title: string; description: string }[];
      departments: { id: number; title: string; description: string }[];
    },
    currentStage?: string,
    currentHouse?: string,
    options?: {
      temperature?: number;
      modelName?: string;
    },
  ): Promise<{
    topicIds: number[];
    sectionIds: number[];
    regionIds: number[];
    departmentIds: number[];
  }> {
    const prompt = AI_PROMPTS.BILL_CLASSIFICATION_GENERATION.replace('{title}', title)
      .replace('{content}', content)
      .replace('{currentStage}', currentStage || 'Unknown')
      .replace('{currentHouse}', currentHouse || 'Unknown')
      .replace('{availableTopics}', this.formatClassifications(classifications.topics))
      .replace('{availableSections}', this.formatClassifications(classifications.sections))
      .replace('{availableRegions}', this.formatClassifications(classifications.regions))
      .replace('{availableDepartments}', this.formatClassifications(classifications.departments));

    const result = await this.getStructuredOutput(
      BillClassificationSchema,
      prompt,
      options?.temperature || 0,
      options?.modelName,
    );

    return {
      topicIds: result.topicIds,
      sectionIds: result.sectionIds,
      regionIds: result.regionIds,
      departmentIds: result.departmentIds,
    };
  }

  async generateBillSummary(
    title: string,
    content: string,
    currentStage?: string,
    currentHouse?: string,
    billType?: string,
    options?: {
      temperature?: number;
      modelName?: string;
    },
  ): Promise<string> {
    const prompt = AI_PROMPTS.BILL_SUMMARY_GENERATION.replace('{title}', title)
      .replace('{content}', content)
      .replace('{currentStage}', currentStage || 'Unknown')
      .replace('{currentHouse}', currentHouse || 'Unknown')
      .replace('{billType}', billType || 'Unknown');

    const result = await this.getStructuredOutput(
      BillSummaryGenerationSchema,
      prompt,
      options?.temperature,
      options?.modelName,
    );
    return result.summary;
  }

  async generateNewsClassification(
    title: string,
    content: string,
    classifications: {
      topics: { id: number; title: string; description: string }[];
      sections: { id: number; title: string; description: string }[];
      regions: { id: number; title: string; description: string }[];
      departments: { id: number; title: string; description: string }[];
    },
    options?: {
      temperature?: number;
      modelName?: string;
    },
  ): Promise<{
    topicIds: number[];
    sectionIds: number[];
    regionIds: number[];
    departmentIds: number[];
  }> {
    const prompt = AI_PROMPTS.NEWS_CLASSIFICATION_GENERATION.replace('{title}', title)
      .replace('{content}', content)
      .replace('{availableTopics}', this.formatClassifications(classifications.topics))
      .replace('{availableSections}', this.formatClassifications(classifications.sections))
      .replace('{availableRegions}', this.formatClassifications(classifications.regions))
      .replace('{availableDepartments}', this.formatClassifications(classifications.departments));

    const result = await this.getStructuredOutput(
      NewsClassificationSchema,
      prompt,
      options?.temperature || 0,
      options?.modelName,
    );

    return {
      topicIds: result.topicIds,
      sectionIds: result.sectionIds,
      regionIds: result.regionIds,
      departmentIds: result.departmentIds,
    };
  }

  async generateNewsSummary(
    title: string,
    content: string,
    options?: {
      temperature?: number;
      modelName?: string;
    },
  ): Promise<string> {
    const prompt = AI_PROMPTS.SUMMARY_GENERATION.replace('{title}', title).replace('{content}', content);

    const result = await this.getStructuredOutput(
      SummaryGenerationSchema,
      prompt,
      options?.temperature || 0,
      options?.modelName,
    );

    return result.summary;
  }

  async generateNewsAnalysis(
    title: string,
    content: string,
    options?: {
      temperature?: number;
      modelName?: string;
    },
  ): Promise<z.infer<typeof NewsAnalysisSchema>> {
    // TODO: Implement available tags logic when provided by the client
    const prompt = AI_PROMPTS.NEWS_ANALYSIS.replace('{title}', title).replace('{content}', content);

    return await this.getStructuredOutput(NewsAnalysisSchema, prompt, options?.temperature || 0, options?.modelName);
  }

  async selectImportantNews(
    //TODO: Impelement types when we will have a news article type
    newsArticles: string,
    options?: {
      temperature?: number;
      modelName?: string;
    },
  ): Promise<z.infer<typeof ImportantNewsSelectionSchema>> {
    const prompt = AI_PROMPTS.IMPORTANT_NEWS_SELECTION.replace('{newsArticles}', newsArticles);

    return await this.getStructuredOutput(
      ImportantNewsSelectionSchema,
      prompt,
      options?.temperature || 0.2,
      options?.modelName,
    );
  }

  async generateMemberClassification(
    memberData: Partial<MemberAggregatedDataDto>,
    classifications: {
      topics: { id: number; title: string; description: string }[];
      sections: { id: number; title: string; description: string }[];
      regions: { id: number; title: string; description: string }[];
      departments: { id: number; title: string; description: string }[];
    },
    options?: {
      temperature?: number;
      modelName?: string;
    },
  ): Promise<{
    topicIds: number[];
    sectionIds: number[];
    regionIds: number[];
    departmentIds: number[];
  }> {
    const prompt = AI_PROMPTS.MEMBER_CLASSIFICATION_GENERATION.replace('{memberName}', memberData.name || 'Unknown')
      .replace('{partyAffiliation}', memberData.partyAffiliation?.name || 'Unknown')
      .replace('{house}', memberData.houseMembership?.house || 'Unknown')
      .replace('{focusAreas}', JSON.stringify(memberData.focusAreas || []))
      .replace('{experience}', JSON.stringify(memberData.experience || []))
      .replace('{committeeRoles}', JSON.stringify(memberData.committeeRoles || []))
      .replace('{memberLocation}', memberData.memberLocation || 'Unknown')
      .replace('{availableTopics}', this.formatClassifications(classifications.topics))
      .replace('{availableSections}', this.formatClassifications(classifications.sections))
      .replace('{availableRegions}', this.formatClassifications(classifications.regions))
      .replace('{availableDepartments}', this.formatClassifications(classifications.departments));

    const result = await this.getStructuredOutput(
      MemberClassificationSchema,
      prompt,
      options?.temperature || 0,
      options?.modelName,
    );

    return {
      topicIds: result.topicIds,
      sectionIds: result.sectionIds,
      regionIds: result.regionIds,
      departmentIds: result.departmentIds,
    };
  }

  async generateMembersNewsClassification(
    questionText: string,
    type: MemberNewsAction.DISCUSSION | MemberNewsAction.SPEECH,
    classifications: {
      topics: { id: number; title: string; description: string }[];
      sections: { id: number; title: string; description: string }[];
      regions: { id: number; title: string; description: string }[];
      departments: { id: number; title: string; description: string }[];
    },
    answerText?: string,
    options?: {
      temperature?: number;
      modelName?: string;
    },
  ): Promise<{
    topicIds: number[];
    sectionIds: number[];
    regionIds: number[];
    departmentIds: number[];
  }> {
    try {
      const prompt = AI_PROMPTS.MEMBERS_NEWS_CLASSIFICATION_GENERATION.replace('{activityType}', type)
        .replace('{questionText}', questionText || '')
        .replace('{answerText}', answerText || 'N/A')
        .replace('{availableTopics}', this.formatClassifications(classifications.topics))
        .replace('{availableSections}', this.formatClassifications(classifications.sections))
        .replace('{availableRegions}', this.formatClassifications(classifications.regions))
        .replace('{availableDepartments}', this.formatClassifications(classifications.departments));

      const result = await this.getStructuredOutput(
        MembersNewsClassificationSchema,
        prompt,
        options?.temperature || 0,
        options?.modelName,
      );

      return {
        topicIds: result.topicIds,
        sectionIds: result.sectionIds,
        regionIds: result.regionIds,
        departmentIds: result.departmentIds,
      };
    } catch (error) {
      return {
        topicIds: [],
        sectionIds: [],
        regionIds: [],
        departmentIds: [],
      };
    }
  }

  async generateMembersNewsSummary(
    questionText: string,
    type: MemberNewsAction.DISCUSSION | MemberNewsAction.SPEECH,
    answerText?: string,
    options?: {
      temperature?: number;
      modelName?: string;
    },
  ): Promise<string> {
    try {
      const prompt = AI_PROMPTS.MEMBERS_NEWS_SUMMARY_GENERATION.replace('{activityType}', type)
        .replace('{questionText}', questionText || '')
        .replace('{answerText}', answerText || 'N/A');

      const result = await this.getStructuredOutput(
        MembersNewsSummarySchema,
        prompt,
        options?.temperature || 0,
        options?.modelName,
      );

      return result.summary;
    } catch (error) {
      return '';
    }
  }

  getChatModel(options?: { temperature?: number; modelName?: string; maxTokens?: number }): ChatOpenAI {
    return new ChatOpenAI({
      temperature: options?.temperature ?? this.openaiConfig.temperature,
      modelName: options?.modelName ?? this.openaiConfig.model,
      apiKey: this.openaiConfig.apiKey,
      maxTokens: options?.maxTokens,
    });
  }

  private formatClassifications(items: { id: number; title: string; description: string }[]): string {
    return items.map((item) => `${item.id}: ${item.title} - ${item.description}`).join(', ');
  }
}
