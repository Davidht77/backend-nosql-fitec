import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Question } from './schema/question.schema';
import { Model } from 'mongoose';

@Injectable()
export class QuestionService {
    constructor(
        @InjectModel('Question') private questionModel: Model<Question>,
    ) {}

    //Register a new question
    async createQuestion(question: Question): Promise<Question> {
        const newQuestion = new this.questionModel(question).save();
        return newQuestion;
    }

    //Get all questions
    async getAllQuestions(): Promise<Question[]> {
        const questions = await this.questionModel.find().sort({order:1}).exec();
        return questions;
    }

    //Get by slug
    async getQuestionByCategorySlug(slug: string): Promise<Question[]> {
        const question = await this.questionModel.find({ slug: slug }).sort({order:1}).exec();
        return question;
    }

    async getUniqueQuestions(slug: string, name: string): Promise<Question[]> {
        return this.questionModel
                .aggregate([
                    {
                    $group: {
                        _id: '$category_slug',
                        category_name: { $first: '$category_name' },
                    },
                    },
                    {
                    $project: {
                        _id: 0,
                        slug: '$_id',
                        name: '$category_name',
                    },
                    },
                    {
                    $sort: { name: 1 }, // Ordenar las categorías por nombre
                    },
                ])
                .exec(); // Ejecuta la agregación y devuelve una Promise
  }
}
