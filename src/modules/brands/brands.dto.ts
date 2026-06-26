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
  Name!: string;
}

export class GetBrandOptionDto {
  id!: number;
  Name!: string;
}

export class GetBrandResponseDto {
  id!: number;
  Name!: string;
  Description?: string | null;
  Country!: GetCountryResponseDto;
  Image!: GetImageResponseDto;
  Lines?: GetLineResponseDto[] | null;
}

export class LinesInnerDto {
  @IsOptional()
  @IsString()
  Name?: string | null;

  @IsOptional()
  @IsString()
  Description?: string | null;
}

export class LinesUpdateInnerDto {
  @IsOptional()
  @IsString()
  Id?: string | null;

  @IsString()
  Name!: string;

  @IsString()
  BrandId!: string;

  @IsBoolean()
  IsNew!: boolean;
}

export class CreateBrandRequestDto {
  @IsString()
  Name!: string;

  @IsOptional()
  @IsString()
  Description?: string | null;

  @IsString()
  CountryId!: string;

  @ValidateNested()
  @Type(() => CreateImageRequestDto)
  Image!: CreateImageRequestDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinesInnerDto)
  Lines?: LinesInnerDto[] | null;
}

export class UpdateBrandRequestDto {
  id!: number;

  @IsString()
  Name!: string;

  @IsOptional()
  @IsString()
  Description?: string | null;

  @IsString()
  CountryId!: string;

  @ValidateNested()
  @Type(() => UpdateImageRequestDto)
  Image!: UpdateImageRequestDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinesUpdateInnerDto)
  Lines?: LinesUpdateInnerDto[] | null;
}
