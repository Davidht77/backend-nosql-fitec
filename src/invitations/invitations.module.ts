import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Invitation, InvitationSchema } from './schema/invitation.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invitation.name, schema: InvitationSchema }]),
  ],
  providers: [InvitationsService],
  controllers: [InvitationsController]
})
export class InvitationsModule {

}
