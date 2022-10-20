import { IsOptional, IsEmail, IsString } from "class-validator";

export class SignupDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  imageBase64?: string;
}
