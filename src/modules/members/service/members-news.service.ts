import { Injectable, Logger } from '@nestjs/common';

import { ClassificationService } from '@modules/classification/service/classification.service';
import { OpenAIService } from '@modules/openai/openai.service';
import { MemberNewsDiscussionDto, MemberNewsSpeechDto } from '../dto/res/members-news.res.dto';
import {
  IEarlyDayMotions,
  IOralquestions,
  IWrittenquestionsDto,
  IWrittenStatementsDto,
  MemberNewsAction,
} from '../types/member-news.types';
import { MembersNewsApiService } from './members-news-api.service';

@Injectable()
export class MembersNewsService {
  private readonly logger = new Logger(MembersNewsService.name);

  constructor(
    private readonly membersNewsApiService: MembersNewsApiService,
    private openAIService: OpenAIService,
    private classificationService: ClassificationService,
  ) {}

  async syncMembersDiscussions(): Promise<MemberNewsDiscussionDto[]> {
    try {
      const [oralquestionsDto, writtenquestionsDto, classifications] = await Promise.all([
        this.membersNewsApiService.getOralquestionsByDate(),
        this.membersNewsApiService.getWrittenquestionsByDate(),
        this.classificationService.findAll(),
      ]);

      const oralQuestionsPromises = oralquestionsDto.map(async (item: IOralquestions) => {
        const questionText = item.QuestionText;
        const answerText = `${item.AnsweringBody} - ${item.AnsweringMinisterTitle}`;
        const [classificationResult, summary] = await Promise.all([
          this.openAIService.generateMembersNewsClassification(
            questionText,
            MemberNewsAction.DISCUSSION,
            classifications,
            answerText,
          ),
          this.openAIService.generateMembersNewsSummary(questionText, MemberNewsAction.DISCUSSION, answerText),
        ]);
        return {
          id: item.Id,
          summary: summary,
          topicIds: classificationResult.topicIds,
          sectorIds: classificationResult.sectionIds,
          regionIds: classificationResult.regionIds,
          departmentIds: classificationResult.departmentIds,
          action: MemberNewsAction.DISCUSSION,
          payload: {
            questionMemberId: item.AskingMemberId,
            questionText: questionText,
            questionDate: item.TabledWhen,
            answerMemberId: null,
            answerText: answerText,
            answerDate: item.AnsweringWhen,
          },
        };
      });

      const writtenQuestionsPromises = writtenquestionsDto.map(async (item: IWrittenquestionsDto) => {
        const questionText = item.value?.questionText;
        const answerText = item.value?.answerText;

        const [classificationResult, summary] = await Promise.all([
          this.openAIService.generateMembersNewsClassification(
            questionText,
            MemberNewsAction.DISCUSSION,
            classifications,
            answerText,
          ),
          this.openAIService.generateMembersNewsSummary(questionText, MemberNewsAction.DISCUSSION, answerText),
        ]);

        return {
          id: item.value?.id,
          summary: summary,
          topicIds: classificationResult.topicIds,
          sectorIds: classificationResult.sectionIds,
          regionIds: classificationResult.regionIds,
          departmentIds: classificationResult.departmentIds,
          action: MemberNewsAction.DISCUSSION,
          payload: {
            questionMemberId: item.value?.askingMemberId,
            questionText: questionText,
            questionDate: item.value?.dateTabled,
            answerMemberId: item.value?.answeringMemberId,
            answerText: answerText,
            answerDate: item.value?.dateAnswered,
          },
        };
      });

      const [oralQuestions, writtenQuestions] = await Promise.all([
        Promise.all(oralQuestionsPromises),
        Promise.all(writtenQuestionsPromises),
      ]);

      return [...oralQuestions, ...writtenQuestions];
    } catch (error) {
      this.logger.error('Error syncing members news', error);
      throw new Error('Failed to sync members news');
    }
  }

  async syncMembersSpeeches(): Promise<MemberNewsSpeechDto[]> {
    try {
      const [earlyDayMotionsDto, writtenStatementsDto, classifications] = await Promise.all([
        this.membersNewsApiService.getEarlyDayMotionsByDate(),
        this.membersNewsApiService.getWrittenStatementsByDate(),
        this.classificationService.findAll(),
      ]);

      const earlyDayMotionsPromises = earlyDayMotionsDto.map(async (item: IEarlyDayMotions) => {
        const questionText = `${item.Title}. ${item.MotionText}`;

        const [classificationResult, summary] = await Promise.all([
          this.openAIService.generateMembersNewsClassification(questionText, MemberNewsAction.SPEECH, classifications, null),
          this.openAIService.generateMembersNewsSummary(questionText, MemberNewsAction.SPEECH, null),
        ]);
        return {
          id: item.Id,
          action: MemberNewsAction.SPEECH,
          summary: summary,
          topicIds: classificationResult.topicIds,
          sectorIds: classificationResult.sectionIds,
          regionIds: classificationResult.regionIds,
          departmentIds: classificationResult.departmentIds,
          payload: {
            speechMemberId: item.MemberId,
            speechTitle: item.Title,
            speechText: item.MotionText,
            speechDate: item.DateTabled,
          },
        };
      });

      const writtenStatementsPromises = writtenStatementsDto.map(async (item: IWrittenStatementsDto) => {
        const questionText = `${item.value?.title}. ${item.value?.text}`;

        const [classificationResult, summary] = await Promise.all([
          this.openAIService.generateMembersNewsClassification(questionText, MemberNewsAction.SPEECH, classifications, null),
          this.openAIService.generateMembersNewsSummary(questionText, MemberNewsAction.SPEECH, null),
        ]);

        return {
          id: item.value?.id,
          action: MemberNewsAction.SPEECH,
          summary: summary,
          topicIds: classificationResult.topicIds,
          sectorIds: classificationResult.sectionIds,
          regionIds: classificationResult.regionIds,
          departmentIds: classificationResult.departmentIds,
          payload: {
            speechMemberId: item.value?.memberId,
            speechTitle: item.value?.title,
            speechText: item.value?.text,
            speechDate: item.value?.dateMade,
          },
        };
      });

      const [earlyDayMotions, writtenStatements] = await Promise.all([
        Promise.all(earlyDayMotionsPromises),
        Promise.all(writtenStatementsPromises),
      ]);

      return [...earlyDayMotions, ...writtenStatements];
    } catch (error) {
      this.logger.error('Error syncing members speeches', error);
      throw new Error('Failed to sync members news');
    }
  }
}
