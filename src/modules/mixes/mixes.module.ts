import { Module } from '@nestjs/common';
import { MixesController } from './mixes.controller';
import { MixesService } from './mixes.service';

@Module({
  controllers: [MixesController],
  providers: [MixesService],
})
export class MixesModule {}
