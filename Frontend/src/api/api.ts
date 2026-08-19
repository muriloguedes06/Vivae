import {api} from './connect'
import type { CurrentUserResponse, TicketmasterEvent, TicketmasterResponse } from '../types';

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

export async function getCurrentUser() {
    const response = await api.get<CurrentUserResponse>('/users/informations');

    return response.data;
}
