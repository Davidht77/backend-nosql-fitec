import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from '@nestjs/swagger';
import { randomUUID, UUID } from "crypto";

@Schema()
export class Feedback {
    @ApiProperty()
    @Prop({ default: randomUUID(), required: true, index: true })
    feedbackId: UUID;
    @ApiProperty()
    @Prop({ required: true })
    clientId: UUID;
    @ApiProperty()
    @Prop({ required: true })
    rating: number;
    @ApiProperty()
    @Prop({ required: true })
    comment: string;
    @ApiProperty()
    @Prop({ required: true })
    createdAt: Date;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);