import { Module, NestMiddleware, Injectable, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { QuestionModule } from './question/question.module';
import { S3Service } from './s3/s3.service';
import { S3Controller } from './s3/s3.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FeedbackModule } from './feedback/feedback.module';
import { InvitationsModule } from './invitations/invitations.module';
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`Request... ${req.method} ${req.originalUrl}`);
    next();
  }
}

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({ // Configura ConfigModule aquí
      isGlobal: true, // Esto hace que ConfigService esté disponible en cualquier módulo sin importarlo explícitamente
       envFilePath: '.env', // Especifica explícitamente la ruta si no está en la raíz
    }),
    QuestionModule, FeedbackModule, InvitationsModule],
  controllers: [AppController, S3Controller],
  providers: [AppService, S3Service, ConfigService],
})
export class AppModule implements NestModule { // AppModule debe implementar NestModule
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*'); // Aplica el middleware a todas las rutas
  }
}
