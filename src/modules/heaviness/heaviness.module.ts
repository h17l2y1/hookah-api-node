import { Module } from '@nestjs/common';
import { HeavinessController } from './heaviness.controller';
import { HeavinessService } from './heaviness.service';

@Module({
  controllers: [HeavinessController],
  providers: [HeavinessService],
})
export class HeavinessModule {}
