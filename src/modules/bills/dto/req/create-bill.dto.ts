import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateBillDto {
  @ApiProperty({ example: 3420 })
  @IsInt()
  billId: number;

  @ApiProperty({ example: 'Affordable Housing (Conversion of Commercial Property) Bill' })
  @IsString()
  shortTitle: string;

  @ApiProperty({ example: [1] })
  @IsArray()
  partyIds: number[];

  @ApiProperty({ example: [3958] })
  @IsArray()
  @IsInt({ each: true })
  memberIds: number[];

  @ApiProperty({ example: 1 })
  @IsInt()
  originatingHouseId: number;

  @ApiProperty({ example: '2023-10-30T15:48:43.496Z' })
  @IsDateString()
  lastUpdate: string;

  @ApiProperty({ example: 6 })
  @IsOptional()
  @IsInt()
  currentStageId?: number | null;

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

  @ApiPropertyOptional({ example: 'This bill focuses on converting commercial properties into affordable housing units.' })
  @IsOptional()
  @IsString()
  summary?: string;
}
