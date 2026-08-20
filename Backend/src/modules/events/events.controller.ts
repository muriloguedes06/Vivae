import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';
import { EventsService } from './events.service';
import type { CreateEventInput } from './events.service';


@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findPublished(@Query('query') query?: string) {
    return this.eventsService.findPublished(query);
  }

  @Get('mine')
  @UseGuards(JwtAuthGuard)
  findMine(@Req() request: Request & { user?: { sub: string } },) {
    return this.eventsService.findMine(request.user!.sub);
  }

  @Get('mine/:id')
  @UseGuards(JwtAuthGuard)
  findMineById(@Req() request: Request & { user?: { sub: string } }, @Param('id') id: string) {
    return this.eventsService.findMineById(request.user!.sub, id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Req() request: Request & { user?: { sub: string } },
    @Body() input: CreateEventInput,
  ) {
    return this.eventsService.create(request.user!.sub, input);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Req() request: Request & { user?: { sub: string } },
    @Param('id') id: string,
    @Body() input: CreateEventInput,
  ) {
    return this.eventsService.update(request.user!.sub, id, input);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Req() request: Request & { user?: { sub: string } }, @Param('id') id: string) {
    return this.eventsService.remove(request.user!.sub, id);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard)
  publish(@Req() request: Request & { user?: { sub: string } }, @Param('id') id: string) {
    return this.eventsService.publish(request.user!.sub, id);
  }

  @Get(':id')
  findPublishedById(@Param('id') id: string) {
    return this.eventsService.findPublishedById(id);
  }
}
