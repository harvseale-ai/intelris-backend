import { z } from 'zod';

export const NewsAnalysisSchema = z.object({
  tags: z.array(z.string()),
  summary: z.string(),
});

export const SummaryGenerationSchema = z.object({
  summary: z.string(),
});

export const ImportantNewsSelectionSchema = z.object({
  selectedNews: z
    .array(
      z.object({
        title: z.string().describe('The title of the selected important news article'),
        importance: z.enum(['critical', 'high', 'medium']).describe('Level of importance for UK citizens'),
        reasoning: z.string().describe('Brief explanation why this news is important for UK citizens'),
      }),
    )
    .describe('List of 5-7 most important news articles'),
  excludedCount: z.number().describe('Number of articles that were excluded from selection'),
  summary: z.string().describe('Brief overview of the current news landscape'),
});

export const BillSummaryGenerationSchema = z.object({
  summary: z.string(),
});

export const BillClassificationSchema = z.object({
  topicIds: z.array(z.number()).min(1).max(7).describe('Array of topic IDs - minimum 1, maximum 7'),
  sectionIds: z.array(z.number()).min(1).max(7).describe('Array of section IDs - minimum 1, maximum 7'),
  regionIds: z.array(z.number()).max(7).describe('Array of region IDs- minimum 1, maximum 7'),
  departmentIds: z.array(z.number()).max(7).describe('Array of department IDs- minimum 1, maximum 7'),
});

export const NewsClassificationSchema = z.object({
  topicIds: z.array(z.number()).min(1).max(7).describe('Array of topic IDs - minimum 1, maximum 7'),
  sectionIds: z.array(z.number()).min(1).max(7).describe('Array of section IDs - minimum 1, maximum 7'),
  regionIds: z.array(z.number()).max(7).describe('Array of region IDs- minimum 1, maximum 7'),
  departmentIds: z.array(z.number()).max(7).describe('Array of department IDs - minimum 1, maximum 7'),
});

export const MemberClassificationSchema = z.object({
  topicIds: z.array(z.number()).min(1).max(7).describe('Array of topic IDs - minimum 1, maximum 7'),
  sectionIds: z.array(z.number()).min(1).max(7).describe('Array of section IDs - minimum 1, maximum 7'),
  regionIds: z.array(z.number()).max(7).describe('Array of region IDs- minimum 1, maximum 7'),
  departmentIds: z.array(z.number()).max(7).describe('Array of department IDs - minimum 1, maximum 7'),
});

export const MembersNewsClassificationSchema = z.object({
  topicIds: z.array(z.number()).min(1).max(7).describe('Array of topic IDs - minimum 1, maximum 7'),
  sectionIds: z.array(z.number()).min(1).max(7).describe('Array of section IDs - minimum 1, maximum 7'),
  regionIds: z.array(z.number()).max(7).describe('Array of region IDs - minimum 1, maximum 7'),
  departmentIds: z.array(z.number()).max(7).describe('Array of department IDs - minimum 1, maximum 7'),
});

export const MembersNewsSummarySchema = z.object({
  summary: z.string().describe('Concise summary of the member news content'),
});
