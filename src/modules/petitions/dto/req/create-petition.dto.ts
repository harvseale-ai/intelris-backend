import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePetitionDto {
  @ApiProperty({ example: 1234 })
  @IsInt()
  petitionId: number;

  @ApiProperty({ example: '2024-11-27T22:52:22.416Z' })
  @IsDateString()
  createdAt: string;

  @ApiProperty({ example: '2025-07-14T16:26:30.000Z' })
  @IsDateString()
  updatedAt: string;

  @ApiProperty({ example: 'Call a General Election' })
  @IsString()
  title: string;

  @ApiProperty({
    example:
      'We are firmly committed to the existing Hong Kong community in the UK and all those who will arrive in future. Further details of measures in the Immigration White Paper will be set out in due course.',
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'This report examines grey zone threats to national defence.' })
  @IsOptional()
  @IsString()
  summary: string;

  @ApiProperty({ example: [10, 11] })
  @IsArray()
  @IsInt({ each: true })
  topicIds: number[];

  @ApiProperty({ example: [10, 11] })
  @IsArray()
  @IsInt({ each: true })
  sectorIds: number[];

  @ApiProperty({ example: [282] })
  @IsArray()
  @IsInt({ each: true })
  regionIds: number[];

  @ApiProperty({ example: [238] })
  @IsArray()
  @IsInt({ each: true })
  departmentIds: number[];

  @ApiPropertyOptional({ example: 'https://www.youtube.com/live/Au9ERa9wE1c?si=U9p72hCgQGsctZrn&t=200' })
  @IsOptional()
  @IsString()
  debateVideoLink?: string;

  @ApiProperty({
    example: ['Ministry of Housing, Communities & Local Government', 'Department for Education'],
    type: 'array',
  })
  @IsArray()
  @IsString({ each: true })
  departmentNames: string[];

  @ApiProperty({
    example: 'https://hansard.parliament.uk/commons/2025-01-06/debates/7132F58B-DE05-4912-8BFC-67F310B55911/GeneralElection',
  })
  @IsOptional()
  @IsString()
  link?: string;
}
