import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class GetAllRequestDto {
  @IsOptional()
  @Transform(({ value }) => Number(value ?? 0))
  @IsInt()
  @Min(0)
  Page = 0;

  @IsOptional()
  @Transform(({ value }) => Number(value ?? 100))
  @IsInt()
  @Min(1)
  Take = 100;

  @IsOptional()
  @IsString()
  SortBy = 'asc';

  @IsOptional()
  @IsString()
  Column = 'name';

  @IsOptional()
  @IsString()
  Name?: string;

  @IsOptional()
  @IsString()
  TagId?: string;

  @IsOptional()
  @IsString()
  BrandId?: string;

  @IsOptional()
  @IsString()
  CountryId?: string;

  @IsOptional()
  @IsString()
  LineId?: string;

  @IsOptional()
  @IsString()
  HeavinessId?: string;
}
