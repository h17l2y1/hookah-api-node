import { IsEmail, IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @IsString()
  FirstName!: string;

  @IsString()
  LastName!: string;

  @IsEmail()
  Email!: string;

  @IsString()
  @MinLength(1)
  Password!: string;

  @IsString()
  Role!: string;
}
