import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';
import { TicketsService } from './tickets.service';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMine(
    @Req() request: Request & { user?: { sub: string } },
  ) {
    return this.ticketsService.findMine(request.user!.sub);
  }

  @Get('my/:id')
  @UseGuards(JwtAuthGuard)
  findMineById(
    @Req() request: Request & { user?: { sub: string } },
    @Param('id') id: string,
  ) {
    return this.ticketsService.findMineById(request.user!.sub, id);
  }

  @Get('shared/:shareToken')
  findShared(@Param('shareToken') shareToken: string) {
    return this.ticketsService.findShared(shareToken);
  }
}
