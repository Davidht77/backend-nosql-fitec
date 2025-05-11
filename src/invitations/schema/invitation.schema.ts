import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

export type InvitationDocument = Invitation & Document;

@Schema({ timestamps: true }) // timestamps: true añade createdAt y updatedAt
export class Invitation {
  @ApiProperty()
  @Prop({ required: true, unique: true, index: true })
  token: string;

  @ApiProperty()
  @Prop({ required: true })
  invitedEmail: string;

  @ApiProperty()
  @Prop({ required: true, default: 'EMPLOYEE_CANDIDATE' }) // Puedes usar esto para diferentes tipos de invitaciones
  invitationType: string;

  @ApiProperty()
  @Prop({ required: true })
  expiresAt: Date;

  @ApiProperty()
  @Prop({ default: false })
  isUsed: boolean;

  @ApiProperty({ required: false })
  @Prop()
  usedAt?: Date;
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);
