import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  invitedEmail: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  invitationType: string = 'EMPLOYEE_CANDIDATE';
}