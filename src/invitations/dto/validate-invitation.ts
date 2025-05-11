import { ApiBody, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateInvitationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}