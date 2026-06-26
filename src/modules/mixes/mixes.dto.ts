import {Type} from 'class-transformer';
import {IsArray, IsString, ValidateNested} from 'class-validator';
import {CreateTobaccoMixRequestDto, TobaccoMixResponseDto} from '../tobaccos/tobaccos.dto';
import {GetReviewResponseDto} from '../reviews/reviews.dto';

export class MixRequestDto {
  @IsString()
  Name!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTobaccoMixRequestDto)
  TobaccoMixes!: CreateTobaccoMixRequestDto[];
}

export class MixResponseDto {
  id!: number;
  Name!: string;
  Rating!: number;
  RatingCount!: number;
  CommentsCount!: number;
  Reviews?: GetReviewResponseDto[] | null;
  TobaccoMixes!: TobaccoMixResponseDto[];
}
