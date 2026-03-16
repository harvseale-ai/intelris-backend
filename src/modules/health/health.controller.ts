import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get()
  hello(): string {
    return 'health check';
  }
}
