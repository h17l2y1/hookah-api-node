import { IsString } from 'class-validator';

export class GetCountryResponseDto {
  id!: number;
  Name!: string;
}

export class CreateCountryRequestDto {
  @IsString()
  Name!: string;
}

export class UpdateCountryRequestDto {
  id!: number;

  @IsString()
  Name!: string;
}
