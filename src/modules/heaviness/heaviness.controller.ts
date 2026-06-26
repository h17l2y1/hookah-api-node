import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HeavinessService } from './heaviness.service';

@ApiTags('Heaviness')
@Controller('api/Heaviness')
export class HeavinessController {
  constructor(private readonly service: HeavinessService) {}

  @Get('GetOptions')
  getOptions() {
    return this.service.getOptions();
  }
}
