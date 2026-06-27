import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { CreateTobaccoMixRequestDto, TobaccoMixResponseDto } from '../tobaccos/tobaccos.dto';
import { GetReviewResponseDto } from '../reviews/reviews.dto';

export class MixRequestDto {
  @IsString()
  name!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTobaccoMixRequestDto)
  tobaccoMixes!: CreateTobaccoMixRequestDto[];
}

export class MixResponseDto {
  id!: number;
  name!: string;
  rating!: number;
  ratingCount!: number;
  commentsCount!: number;
  reviews?: GetReviewResponseDto[] | null;
  tobaccoMixes!: TobaccoMixResponseDto[];
}
