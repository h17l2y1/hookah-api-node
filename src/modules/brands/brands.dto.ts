import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateImageRequestDto, GetImageResponseDto, UpdateImageRequestDto } from '../images/images.dto';
import { GetLineResponseDto } from '../lines/lines.dto';

export class GetCountryResponseDto {
  id!: number;
  name!: string;
}

export class GetBrandOptionDto {
  id!: number;
  name!: string;
}

export class GetBrandResponseDto {
  id!: number;
  name!: string;
  description?: string | null;
  country!: GetCountryResponseDto;
  image!: GetImageResponseDto;
  lines?: GetLineResponseDto[] | null;
}

export class LinesInnerDto {
  @IsOptional()
  @IsString()
  name?: string | null;

  @IsOptional()
  @IsString()
  description?: string | null;
}

export class LinesUpdateInnerDto {
  @IsOptional()
  @IsString()
  id?: string | null;

  @IsString()
  name!: string;

  @IsString()
  brandId!: string;

  @IsBoolean()
  isNew!: boolean;
}

export class CreateBrandRequestDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsString()
  countryId!: string;

  @ValidateNested()
  @Type(() => CreateImageRequestDto)
  image!: CreateImageRequestDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinesInnerDto)
  lines?: LinesInnerDto[] | null;
}

export class UpdateBrandRequestDto {
  id!: number;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsString()
  countryId!: string;

  @ValidateNested()
  @Type(() => UpdateImageRequestDto)
  image!: UpdateImageRequestDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinesUpdateInnerDto)
  lines?: LinesUpdateInnerDto[] | null;
}
