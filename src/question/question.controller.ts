import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Question } from './schema/question.schema';
import { QuestionService } from './question.service';

@Controller('faq')
export class QuestionController {
    constructor(private questionService: QuestionService){}

    // Endpoint para crear una nueva pregunta
    @Post()
    create(@Body() question: Question): Promise<Question> {
        return this.questionService.createQuestion(question);
    }

    // Endpoint para obtener todas las preguntas
    @Get()
    getAll(): Promise<Question[]> {
        return this.questionService.getAllQuestions();
    }

    // Endpoint para obtener preguntas por categoría (slug)
    @Get()
    getByCategory(@Query('slug') slug : string): Promise<Question[]> {
        return this.questionService.getQuestionByCategorySlug(slug);
    }

    // Endpoint para obtener preguntas únicas por slug y nombre
    @Get()
    getUniqueCategories(@Query('slug') slug: string, @Query('name') name: string): Promise<Question[]> {
        return this.questionService.getUniqueQuestions(slug, name);
    }
}
