export type EventCategory = "Show" | "Filme" | "Festival";
export type EventStatus = "Publicado" | "Rascunho" | "Encerrado";
export type UserRole = "CUSTOMER" | "ORGANIZER" | "GATE_STAFF" | "ADMIN";

export interface CurrentUser {
  username: string;
  lastname?: string;
  email: string;
  role: UserRole;
}

export interface CurrentUserResponse {
  user: CurrentUser;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  venue: string;
  city: string;
  price: number;
  maxPrice?: number;
  currency?: string;
  priceSource?: "ticketmaster" | "simulated";
  category: EventCategory;
  image: string;
  sourceDate?: string;
  description?: string;
  note?: string;
}

export interface OrganizerEvent extends EventItem {
  capacity: number;
  sold: number;
  status: EventStatus;
}

export type LocalEventCategory =
  | "CONCERT"
  | "MOVIE"
  | "FESTIVAL"
  | "CONFERENCE"
  | "WORKSHOP"
  | "THEATER"
  | "SPORTS"
  | "OTHER";

export type LocalEventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "FINISHED";

export interface LocalTicketType {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  capacity: number;
  reserved: number;
  sold: number;
  available: number;
  active: boolean;
}

export interface LocalEvent {
  id: string;
  externalSource?: string | null;
  externalId?: string | null;
  title: string;
  description: string;
  category: LocalEventCategory;
  status: LocalEventStatus;
  ticketingMode: "GENERAL_ADMISSION" | "RESERVED_SEATING";
  coverUrl?: string | null;
  venueName: string;
  address: string;
  city: string;
  state: string;
  startsAt: string;
  endsAt?: string | null;
  ticketTypes: LocalTicketType[];
  minPrice: number;
  maxPrice: number;
  capacity: number;
  sold: number;
  seats: Array<{
    id: string;
    row: string;
    number: number;
    label: string;
    blocked: boolean;
    occupied: boolean;
  }>;
}

export interface CreateLocalEventInput {
  externalSource?: string;
  externalId?: string;
  title: string;
  description: string;
  category: LocalEventCategory;
  ticketingMode: "GENERAL_ADMISSION" | "RESERVED_SEATING";
  coverUrl?: string;
  venueName: string;
  address: string;
  city: string;
  state: string;
  startsAt: string;
  publish: boolean;
  seatMap?: { rows: number; columns: number };
  ticketTypes: Array<{
    name: string;
    description?: string;
    price: number;
    capacity: number;
  }>;
}

export interface TmdbMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  release_date: string;
  runtime?: number;
  vote_average: number;
  genres?: Array<{ id: number; name: string }>;
}

export interface TmdbMoviesResponse {
  page: number;
  results: TmdbMovie[];
  total_pages: number;
  total_results: number;
}

export interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  available: number;
}

export interface PurchaseLine {
  ticketTypeId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  seatIds?: string[];
  seatLabels?: string[];
}

export interface PurchaseDraft {
  event: EventItem;
  lines: PurchaseLine[];
  total: number;
}

export type TicketStatus = "ACTIVE" | "USED" | "CANCELLED";

export interface MyTicket {
  id: string;
  code: string;
  qrToken?: string;
  shareToken?: string;
  status: TicketStatus;
  holderName: string;
  issuedAt: string;
  usedAt?: string | null;
  event: {
    id: string;
    title: string;
    category: EventCategory;
    coverUrl?: string | null;
    venueName: string;
    address: string;
    city: string;
    state: string;
    startsAt: string;
    endsAt?: string | null;
  };
  ticketType: { name: string };
  order: { code: string };
  seat?: { label: string } | null;
}

export interface Seat {
  id: string;
  row: string;
  number: number;
  occupied: boolean;
}

export interface TicketmasterImage {
  url: string;
  ratio?: string;
  width?: number;
  height?: number;
  fallback?: boolean;
}

export interface TicketmasterEvent {
  id: string;
  name: string;
  description?: string;
  additionalInfo?: string;
  info?: string;
  pleaseNote?: string;
  priceSource?: "ticketmaster" | "simulated";
  images?: TicketmasterImage[];
  dates?: {
    start?: {
      localDate?: string;
      localTime?: string;
    };
  };
  classifications?: Array<{
    segment?: { name?: string };
    genre?: { name?: string };
  }>;
  priceRanges?: Array<{
    type?: string;
    min?: number;
    max?: number;
    currency?: string;
  }>;
  _embedded?: {
    attractions?: Array<{
      id?: string;
      name?: string;
      description?: string;
      additionalInfo?: string;
    }>;
    venues?: Array<{
      id?: string;
      type?: string;
      name?: string;
      address?: { line1?: string };
      city?: { name?: string };
      state?: { name?: string; stateCode?: string };
      country?: { name?: string; countryCode?: string };
      postalCode?: string;
      location?: { latitude?: string; longitude?: string };
    }>;
  };
}

export interface TicketmasterResponse {
  _embedded?: {
    events?: TicketmasterEvent[];
  };
  page?: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

export type ScanStatus = "success" | "invalid" | "used" | "wrong-event";
