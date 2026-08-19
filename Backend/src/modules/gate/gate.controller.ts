import { Controller, UseGuards, Body, Param, Get, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { GateService } from './gate.service';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';

interface AuthenticatedRequest extends Request {
  user?: Express.User & { sub: string };
}

@Controller('gate')
export class GateController {
    @Get('validate/:token')
    async validate(
        @Req() request: AuthenticatedRequest,
        @Param('token') token: string,
    ) {
        
    }
}
