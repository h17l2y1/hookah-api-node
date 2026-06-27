import { IsString } from 'class-validator';

export class GetLineResponseDto {
  id!: number;
  name!: string;
  brandId!: string;
}

export class CreateLineRequestDto {
  @IsString()
  name!: string;

  description?: string | null;

  @IsString()
  brandId!: string;
}

export class UpdateLineRequestDto {
  id!: number;

  @IsString()
  name!: string;

  description?: string | null;

  @IsString()
  brandId!: string;
}
