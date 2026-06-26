import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetReviewResponseDto {
  TobaccoId?: string | null;
  MixId?: string | null;
  UserId?: string | null;
  IsAnonymous!: boolean;
  Rating!: number;
  Comment?: string | null;
  Name!: string;
  CreationDate!: Date;
}

export class CreateReviewRequestDto {
  TobaccoId?: number | null;
  MixId?: number | null;
  UserId?: number | null;

  @IsOptional()
  @IsString()
  Name?: string | null;

  @IsBoolean()
  IsAnonymous!: boolean;

  @IsNumber()
  Rating!: number;

  @IsOptional()
  @IsString()
  Comment?: string | null;
}
