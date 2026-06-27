import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetReviewResponseDto {
  tobaccoId?: string | null;
  mixId?: string | null;
  userId?: string | null;
  isAnonymous!: boolean;
  rating!: number;
  comment?: string | null;
  name!: string;
  creationDate!: Date;
}

export class CreateReviewRequestDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tobaccoId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  mixId?: number | null;

  @IsOptional()
  @IsString()
  userId?: string | null;

  @IsOptional()
  @IsString()
  name?: string | null;

  @IsBoolean()
  isAnonymous!: boolean;

  @IsNumber()
  rating!: number;

  @IsOptional()
  @IsString()
  comment?: string | null;
}
