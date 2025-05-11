import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Invitation, InvitationDocument } from './schema/invitation.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateInvitationDto } from './dto/create-invitations';
import { v4 as uuidv4 } from 'uuid'; // Para generar tokens únicos

@Injectable()
export class InvitationsService {
  constructor(
    @InjectModel(Invitation.name)
    private invitationModel: Model<InvitationDocument>,
  ) {}

  async create(
    createInvitationDto: CreateInvitationDto,
  ): Promise<InvitationDocument> {
    const { invitedEmail, invitationType } = createInvitationDto;
    const token = uuidv4(); // Genera un token único
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 2); // Token expira en 2 días

    const newInvitation = new this.invitationModel({
      token,
      invitedEmail,
      invitationType,
      expiresAt,
      isUsed: false,
    });

    try {
      return await newInvitation.save();
    } catch (error) {
      // Manejar errores, ej. si el email ya tiene una invitación activa
      throw new ConflictException('Error creating invitation');
    }
  }

  async validateAndConsume(token: string): Promise<{ isValid: boolean; email?}> {
    const invitation = await this.invitationModel.findOne({ token }).exec();

    if (!invitation) {
      throw new NotFoundException('Invitation token not found.');
    }

    if (invitation.isUsed) {
      throw new BadRequestException('Invitation token has already been used.');
    }

    if (invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invitation token has expired.');
    }

    // Marcar como usado
    invitation.isUsed = true;
    invitation.usedAt = new Date();
    await invitation.save();

    return {isValid: true, email: invitation.invitedEmail};
  }

  // Podrías tener un método solo para validar sin consumir si es necesario
  async findByToken(token: string): Promise<InvitationDocument | null> {
    return this.invitationModel.findOne({ token }).exec();
  }
}
