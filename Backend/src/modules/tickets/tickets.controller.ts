import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';
import { TicketsService } from './tickets.service';

interface AuthenticatedRequest extends Request {
  user?: Express.User & { sub: string };
}

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('my')
  findMine(@Req() request: AuthenticatedRequest) {
    return this.ticketsService.findMine(request.user!.sub);
  }

  @Get('my/:id')
  findMineById(
    @Req() request: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.ticketsService.findMineById(request.user!.sub, id);
  }
}
