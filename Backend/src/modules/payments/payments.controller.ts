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
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SimulatePaymentDto } from './payment.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('CUSTOMER', 'ADMIN')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('simulate')
  simulate(
    @Req() request: Request & { user?: { sub: string } },
    @Body() input: SimulatePaymentDto,
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
