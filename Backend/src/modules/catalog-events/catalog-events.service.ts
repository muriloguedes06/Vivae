import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

@Injectable()
export class CatalogEventsService {
  async getTicketmasterEvents(query?: string, page = 0) {
    const apiKey = process.env.TICKET_MASTER_CONSUMER_KEY;

    if (!apiKey) {
      throw new InternalServerErrorException(
        'A chave da Ticketmaster não foi configurada.',
      );
    }

    const url = new URL(
      'https://app.ticketmaster.com/discovery/v2/events.json',
    );

    url.searchParams.set('apikey', apiKey);
    url.searchParams.set('countryCode', 'BR');
    url.searchParams.set('page', String(page));
    url.searchParams.set('size', '20');

    if (query) {
      url.searchParams.set('keyword', query);
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new BadGatewayException(
        `A Ticketmaster respondeu com o status ${response.status}.`,
      );
    }

    const data: unknown = await response.json();
    return data;
  }

  async getTicketmasterEvent(id: string) {
    const apiKey = process.env.TICKET_MASTER_CONSUMER_KEY;

    if (!apiKey) {
      throw new InternalServerErrorException(
        'A chave da Ticketmaster não foi configurada.',
      );
    }

    const url = new URL(
      `https://app.ticketmaster.com/discovery/v2/events/${encodeURIComponent(id)}.json`,
    );
    url.searchParams.set('apikey', apiKey);

    const response = await fetch(url);

    if (!response.ok) {
      throw new BadGatewayException(
        `A Ticketmaster respondeu com o status ${response.status}.`,
      );
    }

    const data: unknown = await response.json();
    return data;
  }

  async getTicketmasterVenue(id: string) {
    const apiKey = process.env.TICKET_MASTER_CONSUMER_KEY;

    if (!apiKey) {
      throw new InternalServerErrorException(
        'A chave da Ticketmaster não foi configurada.',
      );
    }

    const url = new URL(
      `https://app.ticketmaster.com/discovery/v2/venues/${encodeURIComponent(id)}.json`,
    );
    url.searchParams.set('apikey', apiKey);

    const response = await fetch(url);

    if (!response.ok) {
      throw new BadGatewayException(
        `A Ticketmaster respondeu com o status ${response.status}.`,
      );
    }

    const data: unknown = await response.json();
    return data;
  }
}
