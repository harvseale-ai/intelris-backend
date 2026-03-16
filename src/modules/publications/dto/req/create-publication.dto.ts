import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreatePublicationDto {
  @ApiProperty({ example: '1234' })
  @IsString()
  newsId: string;

  @ApiProperty({ example: 'Defence in the Grey Zone' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'https://publications.parliament.uk/pa/cm5901/cmselect/cmdfence/405/report.html' })
  @IsString()
  link: string;

  @ApiProperty({ example: 'Reports are agreed formally by a committee and published by order of the House.' })
  @IsString()
  description: string;

  @ApiProperty({ example: '2025-08-14T09:17:03Z' })
  @IsDateString()
  public_timestamp: string;

  @ApiProperty({ example: [10, 11] })
  @IsArray()
  topicIds: number[];

  @ApiProperty({ example: [10, 11] })
  @IsArray()
  sectorIds: number[];

  @ApiProperty({ example: [282] })
  @IsArray()
  regionIds: number[];

  @ApiProperty({ example: [238] })
  @IsArray()
  departmentIds: number[];

  @ApiPropertyOptional({ example: 'This report examines grey zone threats to national defence.' })
  @IsOptional()
  @IsString()
  summary: string;
}

export interface CommitteeType {
  id: number;
  name: string;
  committeeCategory: CommitteeCategory;
}
export interface CommitteeCategory {
  id: number;
  name: string;
}
