import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';
import { GateService } from './gate.service';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Throttle } from '@nestjs/throttler';
import { ValidateTicketDto } from './gate.dto';

@Controller('gate')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('GATE_STAFF', 'ADMIN')
export class GateController {
  constructor(private readonly gateService: GateService) {}

  @Post('validate')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  validate(
    @Req() request: Request & { user?: { sub: string } },
    @Body() body: ValidateTicketDto,
  ) {
    return this.gateService.validate(
      body.code,
      body.eventId,
      request.user!.sub,
    );
  }
}
