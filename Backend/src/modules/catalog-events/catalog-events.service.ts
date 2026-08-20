import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import type {
  TicketmasterCatalogEvent,
  TicketmasterEventsResponse,
} from './types/ticketmaster.types';
import type { TmdbMovie, TmdbMoviesResponse } from './types/tmdb.types';

@Injectable()
export class CatalogEventsService {
  private readonly tmdbBaseUrl = 'https://api.themoviedb.org/3';
  private readonly tmdbImageBaseUrl = 'https://image.tmdb.org/t/p/w500';

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

    const data = (await response.json()) as TicketmasterEventsResponse;

    return {
      ...data,
      _embedded: data._embedded
        ? {
            ...data._embedded,
            events: data._embedded.events?.map((event) =>
              this.withCatalogPrice(event),
            ),
          }
        : undefined,
    };
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

    const data = (await response.json()) as TicketmasterCatalogEvent;
    return this.withCatalogPrice(data);
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

  async getTmdbMovies(query?: string, page = 1) {
    const path = query?.trim() ? '/search/movie' : '/movie/now_playing';
    const url = new URL(`${this.tmdbBaseUrl}${path}`);
    url.searchParams.set('language', 'pt-BR');
    url.searchParams.set('region', 'BR');
    url.searchParams.set('page', String(Math.max(1, page)));
    url.searchParams.set('include_adult', 'false');
    if (query?.trim()) url.searchParams.set('query', query.trim());

    const data = await this.fetchTmdb<TmdbMoviesResponse>(url);
    return {
      ...data,
      results: data.results.map((movie) => this.withTmdbImages(movie)),
    };
  }

  async getTmdbMovie(id: string) {
    if (!/^\d+$/.test(id)) {
      throw new BadGatewayException('ID de filme inválido.');
    }
    const url = new URL(`${this.tmdbBaseUrl}/movie/${id}`);
    url.searchParams.set('language', 'pt-BR');
    const movie = await this.fetchTmdb<TmdbMovie>(url);
    return this.withTmdbImages(movie);
  }

  private async fetchTmdb<T>(url: URL): Promise<T> {
    const token = process.env.THE_MOVIE_DB_CONSUMER_KEY;
    if (!token) {
      throw new InternalServerErrorException(
        'O token da TMDb não foi configurado.',
      );
    }
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: 'application/json',
      },
    });
    if (!response.ok) {
      throw new BadGatewayException(
        `A TMDb respondeu com o status ${response.status}.`,
      );
    }
    return (await response.json()) as T;
  }

  private withTmdbImages(movie: TmdbMovie) {
    return {
      ...movie,
      posterUrl: movie.poster_path
        ? `${this.tmdbImageBaseUrl}${movie.poster_path}`
        : null,
      backdropUrl: movie.backdrop_path
        ? `${this.tmdbImageBaseUrl}${movie.backdrop_path}`
        : null,
    };
  }

  private withCatalogPrice(event: TicketmasterCatalogEvent) {
    if (event.priceRanges?.length) {
      return {
        ...event,
        priceSource: 'ticketmaster' as const,
      };
    }

    const price = this.createStableDemoPrice(event.id);

    return {
      ...event,
      priceRanges: [
        {
          type: 'standard',
          currency: 'BRL',
          min: price,
          max: price,
        },
      ],
      priceSource: 'simulated' as const,
    };
  }

  private createStableDemoPrice(eventId: string) {
    const hash = Array.from(eventId).reduce(
      (value, character) => (value * 31 + character.charCodeAt(0)) >>> 0,
      0,
    );

    return 10 + (hash % 1991);
  }
}
