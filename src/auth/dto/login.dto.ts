import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  Email!: string;

  @IsString()
  @MinLength(1)
  Password!: string;
}
