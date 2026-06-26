import { IsBoolean, IsString } from 'class-validator';

export class GetTagResponseDto {
  id?: string | null;
  Name!: string;
  Color!: string;
  IsGlobal!: boolean;
}

export class CreateTagRequestDto {
  @IsString()
  Name!: string;

  @IsString()
  Color!: string;

  @IsBoolean()
  IsGlobal!: boolean;
}

export class UpdateTagRequestDto {
  id!: number;

  @IsString()
  Name!: string;

  @IsString()
  Color!: string;

  @IsBoolean()
  IsGlobal!: boolean;
}
