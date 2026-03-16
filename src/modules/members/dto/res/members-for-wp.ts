import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsIn, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

export class MemberWPDto {
  @ApiProperty({ example: 175 })
  @Type(() => Number)
  @IsInt()
  politicianId: number;

  @ApiProperty({ example: 'Ms Diane Abbott' })
  @IsString()
  nameDisplayAs: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  membershipFromId: number;

  @ApiPropertyOptional({ example: 'Some Membership' })
  @IsOptional()
  @IsString()
  membershipFrom?: string;

  @ApiPropertyOptional({ example: 'F' })
  @IsOptional()
  @IsIn(['M', 'F'])
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ example: 'The Rt Hon Ms Diane Abbott' })
  @IsOptional()
  @IsString()
  nameFullTitle?: string;

  @ApiProperty({ example: 5 })
  @Type(() => Number)
  @IsInt()
  houseId: number;

  @ApiProperty({ example: '2025-07-10T13:27:44.0041097' })
  @IsDateString()
  membershipStartDate: string;

  @ApiProperty({ example: 15 })
  @Type(() => Number)
  @IsInt()
  latestPartyId: number;

  @ApiPropertyOptional({
    example: 'https://members-api.parliament.uk/api/Members/172/Thumbnail',
  })
  @IsOptional()
  @IsString()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: [10, 11], description: 'AI-generated topic IDs' })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  topicIds?: number[];

  @ApiPropertyOptional({ example: [5, 8], description: 'AI-generated sector IDs' })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  sectorIds?: number[];

  @ApiPropertyOptional({ example: [3, 7], description: 'AI-generated region IDs' })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  regionIds?: number[];

  @ApiPropertyOptional({ example: [2, 9], description: 'AI-generated department IDs' })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  departmentIds?: number[];
}

export class MembersForWPDto {
  @ApiProperty({ example: 1500 })
  @Type(() => Number)
  @IsInt()
  totalMembers: number;

  @ApiProperty({ example: 0 })
  @Type(() => Number)
  @IsInt()
  skip: number;

  @ApiProperty({ type: [MemberWPDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MemberWPDto)
  items: MemberWPDto[];
}
