import { Controller, UseGuards, Req, Get, Post, Body } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';

interface AuthenticatedRequest extends Request {
  user?: Express.User & { sub: string };
}

@Controller('payments')
export class PaymentsController {
    constructor(private readonly payments: PaymentsService) { };

    @Post('buy')
    @UseGuards(JwtAuthGuard)
    async buy(
        @Body('itemID') itemID: string,
        @Req() request: AuthenticatedRequest,
    ) {

    }
}
