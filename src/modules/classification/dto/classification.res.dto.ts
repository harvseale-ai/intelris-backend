import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class ClassificationResDto {
  @ApiProperty({ example: 3420 })
  @IsInt()
  id: number;

  @ApiProperty({ example: 'Institutions' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Institutions' })
  @IsString()
  description: string;
}
