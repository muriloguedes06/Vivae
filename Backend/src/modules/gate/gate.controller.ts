import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';
import { GateService } from './gate.service';

@Controller('gate')
@UseGuards(JwtAuthGuard)
export class GateController {
  constructor(private readonly gateService: GateService) {}

  @Post('validate')
  validate(
    @Req() request: Request & { user?: { sub: string } },
    @Body() body: { code: string; eventId: string },
  ) {
    return this.gateService.validate(
      body.code,
      body.eventId,
      request.user!.sub,
    );
  }
}
