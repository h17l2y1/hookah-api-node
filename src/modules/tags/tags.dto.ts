import { IsBoolean, IsString } from 'class-validator';

export class GetTagResponseDto {
  id?: string | null;
  name!: string;
  color!: string;
  isGlobal!: boolean;
}

export class CreateTagRequestDto {
  @IsString()
  name!: string;

  @IsString()
  color!: string;

  @IsBoolean()
  isGlobal!: boolean;
}

export class UpdateTagRequestDto {
  id!: number;

  @IsString()
  name!: string;

  @IsString()
  color!: string;

  @IsBoolean()
  isGlobal!: boolean;
}

export class TagImportResultDto {
  totalCount!: number;
  createdCount!: number;
  skippedCount!: number;
}
