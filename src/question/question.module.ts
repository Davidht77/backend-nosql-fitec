import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionSchema } from './schema/question.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
        { name: 'Question', schema: QuestionSchema }
        ]),
    ],
  providers: [QuestionService],
  controllers: [QuestionController]
})
export class QuestionModule {
    
}
