import { MemberNewsAction } from '@modules/members/types/member-news.types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class DiscussionPayloadDto {
  @ApiProperty({ example: 4170 })
  @Type(() => Number)
  @IsInt()
  questionMemberId: number;

  @ApiProperty({
    example: 'That this House congratulates Garstang on the 25th anniversary...',
  })
  @IsString()
  questionText: string;

  @ApiProperty({ example: '2025-08-26T00:00:00' })
  @IsDateString()
  questionDate: string;

  @ApiPropertyOptional({ example: 5266 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  answerMemberId?: number;

  @ApiPropertyOptional({
    example: 'The Government is committed to supporting members of the Hong Kong community...',
  })
  @IsOptional()
  @IsString()
  answerText?: string;

  @ApiPropertyOptional({ example: '2025-09-22T00:00:00' })
  @IsOptional()
  @IsDateString()
  answerDate?: string;
}

export class SpeechPayloadDto {
  @ApiProperty({ example: 4170 })
  @Type(() => Number)
  @IsInt()
  speechMemberId: number;

  @ApiProperty({
    example: 'That this House congratulates Garstang...',
  })
  @IsString()
  speechTitle: string;

  @ApiProperty({
    example: 'That this House congratulates Garstang on the 25th anniversary...',
  })
  @IsString()
  speechText: string;

  @ApiProperty({ example: '2025-08-26T00:00:00' })
  @IsDateString()
  speechDate: string;
}

export class MemberNewsDto {
  @ApiProperty({
    example: 1,
    description: 'Unique identifier of the entity',
  })
  @Type(() => Number)
  @IsInt()
  id: number;

  @ApiProperty({ enum: MemberNewsAction, example: MemberNewsAction.DISCUSSION })
  @IsEnum(MemberNewsAction)
  action: MemberNewsAction;

  @ApiProperty({
    example: 'Question about government support for Hong Kong community',
  })
  @IsString()
  summary: string;

  @ApiProperty({ example: [101, 102] })
  @IsArray()
  @IsInt({ each: true })
  topicIds: number[];

  @ApiProperty({ example: [201] })
  @IsArray()
  @IsInt({ each: true })
  sectorIds: number[];

  @ApiProperty({ example: [301, 302] })
  @IsArray()
  @IsInt({ each: true })
  regionIds: number[];

  @ApiProperty({ example: [401] })
  @IsArray()
  @IsInt({ each: true })
  departmentIds: number[];
}

export class MemberNewsDiscussionDto extends MemberNewsDto {
  @ApiProperty({ type: DiscussionPayloadDto })
  payload: DiscussionPayloadDto;
}

export class MemberNewsSpeechDto extends MemberNewsDto {
  @ApiProperty({ type: SpeechPayloadDto })
  payload: SpeechPayloadDto;
}
