import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { Feedback, FeedbackSchema } from './schemas/feedback.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedbackController } from './feedback.controller';

@Module({
  exports: [FeedbackService],
  imports: [
    MongooseModule.forFeature([
            { name: Feedback.name, schema: FeedbackSchema }
            ]),
  ],
  controllers: [FeedbackController],
  providers: [FeedbackService]
})
export class FeedbackModule {}
