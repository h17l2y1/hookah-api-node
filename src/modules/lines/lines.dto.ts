import { IsString } from 'class-validator';

export class GetLineResponseDto {
  id!: number;
  Name!: string;
  BrandId!: string;
}

export class CreateLineRequestDto {
  @IsString()
  Name!: string;

  Description?: string | null;

  @IsString()
  BrandId!: string;
}

export class UpdateLineRequestDto {
  id!: number;

  @IsString()
  Name!: string;

  Description?: string | null;

  @IsString()
  BrandId!: string;
}
