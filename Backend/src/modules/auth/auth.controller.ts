import { Controller, Body, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authenticator: AuthService) {}

  @Post('register')
  async create(
    @Body('username') username: string,
    @Body('lastname') lastname: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return await this.authenticator.register(
      username,
      lastname,
      email,
      password,
    );
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    return await this.authenticator.login(email, password);
  }

  @Post('refresh')
  async refresh(@Body('refresh_token') refreshToken: string) {
    return await this.authenticator.refresh(refreshToken);
  }
}
