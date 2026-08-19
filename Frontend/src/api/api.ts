import {api} from './connect'
import type {
    CurrentUserResponse,
    CreateLocalEventInput,
    LocalEvent,
    MyTicket,
    TicketmasterEvent,
    TicketmasterResponse,
    TmdbMovie,
    TmdbMoviesResponse,
} from '../types';

interface RegisterData {
    username: string;
    lastname: string;
    email: string;
    password: string;
}

interface LoginData {
    email: string;
    password: string;
}

export async function register(data: RegisterData) {
    const response = await api.post('/auth/register', data);

    return response.data;
}

export async function login(data: LoginData) {
    const response = await api.post('/auth/login', data);

    return response.data;
}

export async function getTicketmasterEvents(query = '', page = 0) {
    const response = await api.get<TicketmasterResponse>('/catalog-events/ticketmaster', {
        params: { query: query || undefined, page },
    });

    return response.data;
}

export async function getTicketmasterEvent(id: string) {
    const response = await api.get<TicketmasterEvent>(
        `/catalog-events/ticketmaster/${encodeURIComponent(id)}`,
    );

    return response.data;
}

export async function getTmdbMovies(query = '', page = 1) {
    const response = await api.get<TmdbMoviesResponse>('/catalog-events/tmdb/movies', {
        params: { query: query || undefined, page },
    });
    return response.data;
}

export async function getTmdbMovie(id: string) {
    const response = await api.get<TmdbMovie>(`/catalog-events/tmdb/movies/${encodeURIComponent(id)}`);
    return response.data;
}

export async function getCurrentUser() {
    const response = await api.get<CurrentUserResponse>('/users/informations');

    return response.data;
}

export async function getPublishedEvents(query = '') {
    const response = await api.get<LocalEvent[]>('/events', {
        params: { query: query || undefined },
    });
    return response.data;
}

export async function getPublishedEvent(id: string) {
    const response = await api.get<LocalEvent>(`/events/${encodeURIComponent(id)}`);
    return response.data;
}

export async function getOrganizerEvents() {
    const response = await api.get<LocalEvent[]>('/events/mine');
    return response.data;
}

export async function getOrganizerEvent(id: string) {
    const response = await api.get<LocalEvent>(`/events/mine/${encodeURIComponent(id)}`);
    return response.data;
}

export async function createLocalEvent(data: CreateLocalEventInput) {
    const response = await api.post<LocalEvent>('/events', data);
    return response.data;
}

export async function updateLocalEvent(id: string, data: CreateLocalEventInput) {
    const response = await api.patch<LocalEvent>(`/events/${encodeURIComponent(id)}`, data);
    return response.data;
}

export async function deleteLocalEvent(id: string) {
    await api.delete(`/events/${encodeURIComponent(id)}`);
}

export async function getMyTickets() {
    const response = await api.get<MyTicket[]>('/tickets/my');

    return response.data;
}

export async function getMyTicket(id: string) {
    const response = await api.get<MyTicket>(
        `/tickets/my/${encodeURIComponent(id)}`,
    );

    return response.data;
}
