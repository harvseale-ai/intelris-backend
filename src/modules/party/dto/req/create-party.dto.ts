import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePartyDto {
  @ApiProperty({ example: 7, description: 'External party ID from Parliament API' })
  @IsInt()
  partyId: number;

  @ApiProperty({ example: 'Democratic Unionist Party', description: 'Full name of the party' })
  @IsString()
  name: string;

  @ApiProperty({ example: true, description: 'Is this party represented in the House of Commons?' })
  @IsBoolean()
  @IsOptional()
  isCommons?: boolean = false;

  @ApiProperty({ example: true, description: 'Is this party represented in the House of Lords?' })
  @IsBoolean()
  @IsOptional()
  isLords?: boolean = false;

  @ApiProperty({ example: false, description: 'Is this an independent party?' })
  @IsBoolean()
  @IsOptional()
  isIndependent?: boolean = false;
}
