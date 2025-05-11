import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateInvitationDto } from './dto/create-invitations';
import { ValidateInvitationDto } from './dto/validate-invitation';
import { InvitationsService } from './invitations.service';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  // Endpoint para crear una nueva invitación
  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async create(@Body() createInvitationDto: CreateInvitationDto) {
    try {
        const invitation = await this.invitationsService.create(createInvitationDto);
        return { token: invitation.token, invitedEmail: invitation.invitedEmail, expiresAt: invitation.expiresAt };
    } catch (error) {
        throw new HttpException(error.message, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Endpoint para validar y consumir un token de invitación
  @Post('validate-and-consume')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async validateAndConsumeToken(@Body() validateDto: ValidateInvitationDto) {
    try {
        return await this.invitationsService.validateAndConsume(validateDto.token);
    } catch (error) {
        throw new HttpException(error.message, error.status || HttpStatus.BAD_REQUEST);
    }
  }

  // Endpoint para obtener la información de una invitación por su token
  @Get(':token')
  async getInvitation(@Param('token') token: string) {
    const invitation = await this.invitationsService.findByToken(token);
    if (!invitation) {
      throw new HttpException('Invitation not found', HttpStatus.NOT_FOUND);
    }
    return invitation; // Devuelve la info del token (sin datos sensibles si es público)
  }
}
