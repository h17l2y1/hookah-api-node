import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

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
  tobaccoId?: number | null;
  mixId?: number | null;
  userId?: number | null;

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
