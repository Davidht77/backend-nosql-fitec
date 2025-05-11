import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Question {

    @ApiProperty()
    @Prop({ required: true })
    question: string;

    @ApiProperty()
    @Prop({ required: true })
    answer: string;

    @ApiProperty()
    @Prop({ required: true, index: true }) // Indicar index: true para consultas rápidas por category_slug
    category_slug: string;

    @ApiProperty()
    @Prop({ required: true })
    category_name: string;

    @ApiProperty({ required: false })
    @Prop({ type: Number })
    order?: number; // Usamos '?' porque puede ser opcional
}

export const QuestionSchema = SchemaFactory.createForClass(Question);