import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateImageRequestDto, GetImageResponseDto, UpdateImageRequestDto } from '../images/images.dto';
import { GetTagResponseDto } from '../tags/tags.dto';
import { GetReviewResponseDto } from '../reviews/reviews.dto';

export class TobaccoTagCreateDto {
  @IsOptional()
  @IsString()
  id?: string | null;

  @IsString()
  tagId!: string;

  @IsOptional()
  @IsString()
  tobaccoId?: string | null;

  @IsOptional()
  @IsBoolean()
  isNew?: boolean | null;

  @IsOptional()
  @IsBoolean()
  isRemoved?: boolean | null;
}

export class UpdateTobaccoTagDto {
  @IsOptional()
  @IsString()
  id?: string | null;

  @IsString()
  tagId!: string;

  @IsString()
  tobaccoId!: string;

  @IsOptional()
  @IsBoolean()
  isNew?: boolean | null;

  @IsOptional()
  @IsBoolean()
  isRemoved?: boolean | null;
}

export class TobaccoTagRequestDto {
  @IsOptional()
  @IsString()
  id?: string | null;

  @IsString()
  tagId!: string;

  @IsString()
  tobaccoId!: string;

  @IsOptional()
  @IsBoolean()
  isNew?: boolean | null;

  @IsOptional()
  @IsBoolean()
  isRemoved?: boolean | null;
}

export class GetBrandInnerDto {
  id!: number;
  name!: string;
}

export class TobaccoMixResponseDto {
  id!: number;
  tobaccoId!: string;
  percent!: number;
}

export class CreateTobaccoMixRequestDto {
  @IsString()
  tobaccoId!: string;

  @IsNumber()
  percent!: number;
}

export class GetTobaccoResponseDto {
  id!: number;
  name!: string;
  description?: string | null;
  lineId!: string;
  brandId!: string;
  heavinessId!: string;
  rating!: number;
  ratingCount!: number;
  commentsCount!: number;
  image?: GetImageResponseDto | null;
  brand?: GetBrandInnerDto | null;
  tags?: GetTagResponseDto[] | null;
  tobaccoTags?: TobaccoTagRequestDto[] | null;
  reviews?: GetReviewResponseDto[] | null;
}

export class CreateTobaccoRequestDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsString()
  lineId!: string;

  @IsString()
  brandId!: string;

  @IsString()
  heavinessId!: string;

  @ValidateNested()
  @Type(() => CreateImageRequestDto)
  image!: CreateImageRequestDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TobaccoTagCreateDto)
  tobaccoTags?: TobaccoTagCreateDto[] | null;
}

export class UpdateTobaccoRequestDto {
  @Type(() => Number)
  @IsNumber()
  id!: number;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsString()
  lineId!: string;

  @IsString()
  heavinessId!: string;

  @IsString()
  brandId!: string;

  @IsOptional()
  @IsNumber()
  rating?: number | null;

  @ValidateNested()
  @Type(() => UpdateImageRequestDto)
  image!: UpdateImageRequestDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTobaccoTagDto)
  tobaccoTags!: UpdateTobaccoTagDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GetTagResponseDto)
  tags!: GetTagResponseDto[];
}
