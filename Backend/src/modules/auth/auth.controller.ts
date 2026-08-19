import { Controller, Body, Get, Post } from '@nestjs/common';
import { authenticate } from 'passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authenticator: AuthService){}

    @Post('register')
    async create(
        @Body('username') username: string,
        @Body('lastname') lastname: string,
        @Body('email') email: string,
        @Body('password') password: string,
    ) {
        return await this.authenticator.register(username, lastname, email, password);
    }

    @Post('login')
    async login(
        @Body('email') email: string,
        @Body('password') password: string,
    ) {
        return await this.authenticator.login(email, password);
    }
}
