import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ImageType } from '../../common/enums/image-type.enum';

export class GetImageResponseDto {
  id!: number;
  name!: string;
  link!: string;
  type!: ImageType;
}

export class CreateImageRequestDto {
  @IsString()
  base64!: string;

  @IsString()
  name!: string;

  @IsEnum(ImageType)
  type!: ImageType;
}

export class UpdateImageRequestDto {
  id!: number;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  base64?: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsEnum(ImageType)
  type?: ImageType;
}
