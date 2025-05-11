import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Feedback } from './schemas/feedback.schema';
import { Model } from 'mongoose';

@Injectable()
export class FeedbackService {
    constructor(
        @InjectModel(Feedback.name) private feedbackModel: Model<Feedback>,
    ) {}

    async createFeedback(feedback: Feedback): Promise<Feedback> {
        const newFeedback = new this.feedbackModel(feedback);
        return newFeedback.save();
    }

    async getAllFeedback(): Promise<Feedback[]> {
        return this.feedbackModel.find().exec();
    }

    async deleteFeedback(feedbackId: string): Promise<null> {
        this.feedbackModel.findByIdAndDelete(feedbackId).exec();
        return null;
    }

    async getFeedbackByClientId(clientId: string): Promise<Feedback[]> {
        return this.feedbackModel.find({ clientId }).exec();
    }
}
