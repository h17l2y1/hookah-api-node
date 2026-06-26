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
  Id?: string | null;

  @IsString()
  TagId!: string;

  @IsOptional()
  @IsString()
  TobaccoId?: string | null;

  @IsOptional()
  @IsBoolean()
  IsNew?: boolean | null;

  @IsOptional()
  @IsBoolean()
  IsRemoved?: boolean | null;
}

export class UpdateTobaccoTagDto {
  @IsOptional()
  @IsString()
  Id?: string | null;

  @IsString()
  TagId!: string;

  @IsString()
  TobaccoId!: string;

  @IsOptional()
  @IsBoolean()
  IsNew?: boolean | null;

  @IsOptional()
  @IsBoolean()
  IsRemoved?: boolean | null;
}

export class TobaccoTagRequestDto {
  @IsOptional()
  @IsString()
  Id?: string | null;

  @IsString()
  TagId!: string;

  @IsString()
  TobaccoId!: string;

  @IsOptional()
  @IsBoolean()
  IsNew?: boolean | null;

  @IsOptional()
  @IsBoolean()
  IsRemoved?: boolean | null;
}

export class GetBrandInnerDto {
  id!: number;
  Name!: string;
}

export class TobaccoMixResponseDto {
  id!: number;
  TobaccoId!: string;
  Percent!: number;
}

export class CreateTobaccoMixRequestDto {
  @IsString()
  TobaccoId!: string;

  @IsNumber()
  Percent!: number;
}

export class GetTobaccoResponseDto {
  id!: number;
  Name!: string;
  Description?: string | null;
  LineId!: string;
  BrandId!: string;
  HeavinessId!: string;
  Rating!: number;
  RatingCount!: number;
  CommentsCount!: number;
  Image?: GetImageResponseDto | null;
  Brand?: GetBrandInnerDto | null;
  Tags?: GetTagResponseDto[] | null;
  TobaccoTags?: TobaccoTagRequestDto[] | null;
  Reviews?: GetReviewResponseDto[] | null;
}

export class CreateTobaccoRequestDto {
  @IsString()
  Name!: string;

  @IsOptional()
  @IsString()
  Description?: string | null;

  @IsString()
  LineId!: string;

  @IsString()
  BrandId!: string;

  @IsString()
  HeavinessId!: string;

  @ValidateNested()
  @Type(() => CreateImageRequestDto)
  Image!: CreateImageRequestDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TobaccoTagCreateDto)
  TobaccoTags?: TobaccoTagCreateDto[] | null;
}

export class UpdateTobaccoRequestDto {
  id!: number;

  @IsString()
  Name!: string;

  @IsOptional()
  @IsString()
  Description?: string | null;

  @IsString()
  LineId!: string;

  @IsString()
  HeavinessId!: string;

  @IsString()
  BrandId!: string;

  @IsOptional()
  @IsNumber()
  Rating?: number | null;

  @ValidateNested()
  @Type(() => UpdateImageRequestDto)
  Image!: UpdateImageRequestDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTobaccoTagDto)
  TobaccoTags!: UpdateTobaccoTagDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GetTagResponseDto)
  Tags!: GetTagResponseDto[];
}
