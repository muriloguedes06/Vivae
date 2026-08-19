export interface TicketmasterPriceRange {
  type: string;
  currency: string;
  min: number;
  max: number;
}

export interface TicketmasterCatalogEvent {
  id: string;
  priceRanges?: TicketmasterPriceRange[];
  priceSource?: 'ticketmaster' | 'simulated';
  [key: string]: unknown;
}

export interface TicketmasterEventsResponse {
  _embedded?: {
    events?: TicketmasterCatalogEvent[];
    [key: string]: unknown;
  };
  [key: string]: unknown;
}
