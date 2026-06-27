import { IsString } from 'class-validator';

export class GetCountryResponseDto {
  id!: number;
  name!: string;
}

export class CreateCountryRequestDto {
  @IsString()
  name!: string;
}

export class UpdateCountryRequestDto {
  id!: number;

  @IsString()
  name!: string;
}
