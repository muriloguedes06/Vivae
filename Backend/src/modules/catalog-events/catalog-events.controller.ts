import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogEventsService } from './catalog-events.service';

@Controller('catalog-events')
export class CatalogEventsController {
  constructor(private readonly catalogEventsService: CatalogEventsService) {}

  @Get('ticketmaster')
  getTicketmasterEvents(
    @Query('query') query?: string,
    @Query('keyword') keyword?: string,
    @Query('page') page?: string,
  ) {
    return this.catalogEventsService.getTicketmasterEvents(
      keyword ?? query,
      Number(page ?? 0),
    );
  }

  @Get('ticketmaster/venues/:id')
  getTicketmasterVenue(@Param('id') id: string) {
    return this.catalogEventsService.getTicketmasterVenue(id);
  }

  @Get('ticketmaster/:id')
  getTicketmasterEvent(@Param('id') id: string) {
    return this.catalogEventsService.getTicketmasterEvent(id);
  }
}
