import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import configuration from './config/configuration';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { BrandsModule } from './modules/brands/brands.module';
import { CountriesModule } from './modules/countries/countries.module';
import { HeavinessModule } from './modules/heaviness/heaviness.module';
import { ImagesModule } from './modules/images/images.module';
import { LinesModule } from './modules/lines/lines.module';
import { MixesModule } from './modules/mixes/mixes.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { TagsModule } from './modules/tags/tags.module';
import { TobaccosModule } from './modules/tobaccos/tobaccos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    CommonModule,
    AuthModule,
    BrandsModule,
    CountriesModule,
    HeavinessModule,
    ImagesModule,
    LinesModule,
    MixesModule,
    ReviewsModule,
    TagsModule,
    TobaccosModule,
  ],
})
export class AppModule {}
