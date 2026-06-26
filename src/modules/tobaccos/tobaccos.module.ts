import { Module } from '@nestjs/common';
import { TobaccosController } from './tobaccos.controller';
import { TobaccosService } from './tobaccos.service';

@Module({
  controllers: [TobaccosController],
  providers: [TobaccosService],
})
export class TobaccosModule {}
