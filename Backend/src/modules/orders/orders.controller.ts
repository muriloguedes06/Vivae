import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';
import { OrdersService } from './orders.service';
import type { CreateOrderInput } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @Req() request: Request & { user?: { sub: string } },
    @Body() input: CreateOrderInput,
  ) {
    return this.ordersService.create(request.user!.sub, input);
  }

  @Get('my')
  findMine(
    @Req() request: Request & { user?: { sub: string } },
  ) {
    return this.ordersService.findMine(request.user!.sub);
  }

  @Get('my/:id')
  findMineById(
    @Req() request: Request & { user?: { sub: string } },
    @Param('id') id: string,
  ) {
    return this.ordersService.findMineById(request.user!.sub, id);
  }

  @Patch(':id/cancel')
  cancel(
    @Req() request: Request & { user?: { sub: string } },
    @Param('id') id: string,
  ) {
    return this.ordersService.cancel(request.user!.sub, id);
  }
}
