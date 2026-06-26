import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ImageType } from '../../common/enums/image-type.enum';

export class GetImageResponseDto {
  id!: number;
  Name!: string;
  Link!: string;
  Type!: ImageType;
}

export class CreateImageRequestDto {
  @IsString()
  Base64!: string;

  @IsString()
  Name!: string;

  @IsEnum(ImageType)
  Type!: ImageType;
}

export class UpdateImageRequestDto {
  id!: number;

  @IsString()
  Name!: string;

  @IsOptional()
  @IsString()
  Base64?: string;

  @IsOptional()
  @IsString()
  Link?: string;

  @IsOptional()
  @IsEnum(ImageType)
  Type?: ImageType;
}
