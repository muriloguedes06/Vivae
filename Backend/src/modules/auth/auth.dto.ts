import { IsEmail, IsString, Length, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @Length(5, 60)
  username: string;

  @IsString()
  @Length(2, 100)
  lastname: string;

  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @Length(8, 72)
  password: string;
}

export class LoginDto {
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsString()
  @Length(1, 72)
  password: string;
}

export class RefreshDto {
  @IsString()
  @Length(20, 4096)
  refresh_token: string;
}
