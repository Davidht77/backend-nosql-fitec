import { Body, Controller, Delete, Get, Post, Query, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { Feedback } from './schemas/feedback.schema';

@Controller('feedback')
export class FeedbackController {
    constructor(private feedbackService: FeedbackService) {}

    //Add exceptions for each method

    @Post()
    async createFeedback(@Body() feedback: Feedback): Promise<Feedback> {
        try {
            const newFeedback = await this.feedbackService.createFeedback(feedback);
            return newFeedback;
        } catch (error) {
            throw new HttpException(error.message || 'Error creating feedback', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get()
    async getAllFeedback(): Promise<Feedback[]> {
        try {
            const feedbackList = await this.feedbackService.getAllFeedback();
            return feedbackList;
        } catch (error) {
            throw new HttpException(error.message || 'Error fetching feedback list', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete()
    async deleteFeedback(@Query('feedbackId') feedbackId: string): Promise<null> {
        try {
            const deletedFeedback = await this.feedbackService.deleteFeedback(feedbackId);
            if (deletedFeedback === undefined) { // Assuming service returns undefined or throws if not found
                throw new NotFoundException(`Feedback with ID "${feedbackId}" not found`);
            }
            return null; // NestJS automatically sends 200 OK for null, or 204 No Content if @HttpCode(204) is used
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new HttpException(error.message || 'Error deleting feedback', error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('client')
    async getFeedbackByClientId(@Query('clientId') clientId: string): Promise<Feedback[]> {
        try {
            const feedbackList = await this.feedbackService.getFeedbackByClientId(clientId);
            // It's common to return an empty array if no feedback is found for a client, rather than a 404.
            // However, if the service layer explicitly throws a NotFoundException, it will be caught below.
            return feedbackList;
        } catch (error) {
             if (error instanceof NotFoundException) {
                throw error;
            }
            throw new HttpException(error.message || `Error fetching feedback for client ${clientId}`, error.status || HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
