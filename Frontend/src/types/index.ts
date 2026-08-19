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
}

export interface PurchaseDraft {
  event: EventItem;
  lines: PurchaseLine[];
  total: number;
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
