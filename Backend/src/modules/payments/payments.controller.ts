import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';
import { PaymentsService } from './payments.service';
import type { SimulatePaymentInput } from './payments.service';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('simulate')
  simulate(
    @Req() request: Request & { user?: { sub: string } },
    @Body() input: SimulatePaymentInput,
  ) {
    return this.paymentsService.simulate(request.user!.sub, input);
  }

  @Get('order/:orderId')
  findByOrder(
    @Req() request: Request & { user?: { sub: string } },
    @Param('orderId') orderId: string,
  ) {
    return this.paymentsService.findByOrder(request.user!.sub, orderId);
  }
}
