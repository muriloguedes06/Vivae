import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';

@Controller('users')
export class UsersController {
    constructor(private readonly users: UsersService){}

    @Get('informations')
    @UseGuards(JwtAuthGuard)
    async checkUser(
        @Req() req: Request,
    ) {
        const userId = req.user!['sub'];
        return await this.users.checkUser(userId);
    }
}
