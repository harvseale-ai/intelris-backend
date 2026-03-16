import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateNewsDto {
  @ApiProperty({ example: '/government/calls-for-evidence/health-institution-exemption-stakeholder-survey' })
  @IsString()
  newsId: string;

  @ApiProperty({ example: 'Health Institution Exemption – Stakeholder survey' })
  @IsString()
  title: string;

  @ApiProperty({ example: '/government/calls-for-evidence/health-institution-exemption-stakeholder-survey' })
  @IsString()
  link: string;

  @ApiProperty({
    example:
      'The MHRA invites health institutions in Great Britain to share their experience of the health institution exemption (sometimes referred to as an in-house manufacturing exemption).',
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({ example: 'This bill focuses on converting commercial properties into affordable housing units.' })
  @IsOptional()
  @IsString()
  summary: string;

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
}
