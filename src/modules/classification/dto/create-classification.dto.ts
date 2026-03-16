import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class ClassificationDto {
  @ApiProperty({ example: 3420 })
  @IsInt()
  externalId: number;

  @ApiProperty({ example: 'topic' })
  @IsString()
  type: ClassificationType;

  @ApiProperty({ example: 'Institutions' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Institutions' })
  @IsString()
  description: string;
}

export enum ClassificationType {
  TOPIC = 'topic',
  SECTION = 'section',
  REGION = 'region',
  DEPARTMENT = 'department',
}
