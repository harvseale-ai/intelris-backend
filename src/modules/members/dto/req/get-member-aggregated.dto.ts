import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class GetMemberAggregatedDto {
  @ApiProperty({ example: 3898 })
  @IsInt()
  memberId: number;
}
