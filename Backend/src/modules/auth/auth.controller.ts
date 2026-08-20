import {
  Controller,
  Body,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Throttle } from '@nestjs/throttler';
import { LoginDto, RegisterDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authenticator: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async create(@Body() body: RegisterDto) {
    return await this.authenticator.register(
      body.username,
      body.lastname,
      body.email,
      body.password,
    );
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.authenticator.login(body.email, body.password);
    this.setRefreshCookie(response, result.refresh_token);

    const { refresh_token, ...safeResult } = result;
    void refresh_token;
    return safeResult;
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.refresh_token as string | undefined;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token não informado.');
    }

    const result = await this.authenticator.refresh(refreshToken);
    this.setRefreshCookie(response, result.refresh_token);

    const { refresh_token, ...safeResult } = result;
    void refresh_token;
    return safeResult;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('refresh_token', this.cookieOptions());
    return { message: 'Logout realizado com sucesso.' };
  }

  private setRefreshCookie(response: Response, token: string) {
    response.cookie('refresh_token', token, {
      ...this.cookieOptions(),
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  private cookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
    };
  }
}
