import { Global, Module } from '@nestjs/common';
import { ImgurService } from './services/imgur.service';

@Global()
@Module({
  providers: [ImgurService],
  exports: [ImgurService],
})
export class CommonModule {}
