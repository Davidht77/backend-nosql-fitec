import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // Endpoint para obtener un saludo
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
