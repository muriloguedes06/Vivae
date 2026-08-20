import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { EventCategory, TicketingMode } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

interface CreateTicketTypeInput {
  name: string;
  description?: string;
  price: number;
  capacity: number;
}

export interface CreateEventInput {
  externalSource?: string;
  externalId?: string;
  title: string;
  description: string;
  category?: EventCategory;
  ticketingMode?: TicketingMode;
  coverUrl?: string;
  venueName: string;
  address: string;
  city: string;
  state: string;
  startsAt: string;
  endsAt?: string;
  publish?: boolean;
  seatMap?: { rows: number; columns: number };
  ticketTypes: CreateTicketTypeInput[];
}

const eventInclude = {
  ticketTypes: {
    where: { active: true },
    orderBy: { price: 'asc' as const },
  },
  seats: { include: { _count: { select: { orderItems: true } } } },
} as const;

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async findPublished(query?: string) {
    const normalizedQuery = query?.trim();
    const events = await this.prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        ...(normalizedQuery
          ? {
              OR: [
                {
                  title: {
                    contains: normalizedQuery,
                    mode: 'insensitive' as const,
                  },
                },
                {
                  city: {
                    contains: normalizedQuery,
                    mode: 'insensitive' as const,
                  },
                },
              ],
            }
          : {}),
      },
      include: eventInclude,
      orderBy: { startsAt: 'asc' },
    });
    return events.map((event) => this.toResponse(event));
  }

  async findPublishedById(id: string) {
    const event = await this.prisma.event.findFirst({
      where: { id, status: 'PUBLISHED' },
      include: eventInclude,
    });
    if (!event) throw new NotFoundException('Evento publicado não encontrado.');
    return this.toResponse(event);
  }

  async findMine(organizerId: string) {
    await this.assertOrganizer(organizerId);
    const events = await this.prisma.event.findMany({
      where: { organizerId },
      include: eventInclude,
      orderBy: { createdAt: 'desc' },
    });
    return events.map((event) => this.toResponse(event));
  }

  async findMineById(organizerId: string, id: string) {
    await this.assertOrganizer(organizerId);
    const event = await this.prisma.event.findFirst({
      where: { id, organizerId },
      include: eventInclude,
    });
    if (!event)
      throw new NotFoundException('Evento do organizador não encontrado.');
    return this.toResponse(event);
  }

  async create(organizerId: string, input: CreateEventInput) {
    await this.assertOrganizer(organizerId);
    const startsAt = new Date(input.startsAt);
    const endsAt = input.endsAt ? new Date(input.endsAt) : undefined;
    const ticketTypes = input.ticketTypes ?? [];
    this.validateSeatMap(input);

    if (
      !input.title?.trim() ||
      !input.description?.trim() ||
      !input.venueName?.trim() ||
      !input.address?.trim() ||
      !input.city?.trim() ||
      !input.state?.trim() ||
      Number.isNaN(startsAt.getTime())
    ) {
      throw new BadRequestException(
        'Preencha os dados obrigatórios do evento.',
      );
    }
    if (endsAt && (Number.isNaN(endsAt.getTime()) || endsAt <= startsAt)) {
      throw new BadRequestException(
        'O término deve acontecer depois do início.',
      );
    }
    if (
      ticketTypes.length === 0 ||
      ticketTypes.some(
        (type) =>
          !type.name?.trim() ||
          !Number.isFinite(Number(type.price)) ||
          Number(type.price) <= 0 ||
          !Number.isInteger(Number(type.capacity)) ||
          Number(type.capacity) <= 0,
      )
    ) {
      throw new BadRequestException(
        'Informe ao menos um tipo com preço e capacidade positivos.',
      );
    }

    try {
      const event = await this.prisma.event.create({
        data: {
          organizerId,
          externalSource: input.externalSource?.trim() || null,
          externalId: input.externalId?.trim() || null,
          title: input.title.trim(),
          description: input.description.trim(),
          category: input.category ?? 'OTHER',
          ticketingMode: input.ticketingMode ?? 'GENERAL_ADMISSION',
          status: input.publish ? 'PUBLISHED' : 'DRAFT',
          coverUrl: input.coverUrl?.trim() || null,
          venueName: input.venueName.trim(),
          address: input.address.trim(),
          city: input.city.trim(),
          state: input.state.trim().toUpperCase(),
          startsAt,
          endsAt,
          ticketTypes: {
            create: ticketTypes.map((type) => ({
              name: type.name.trim(),
              description: type.description?.trim() || null,
              price: Number(type.price),
              capacity: Number(type.capacity),
            })),
          },
          seats:
            input.ticketingMode === 'RESERVED_SEATING' && input.seatMap
              ? {
                  create: this.buildSeats(
                    input.seatMap.rows,
                    input.seatMap.columns,
                  ),
                }
              : undefined,
        },
        include: eventInclude,
      });
      return this.toResponse(event);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException(
          'Este evento do catálogo já foi importado pelo organizador.',
        );
      }
      throw error;
    }
  }

  async publish(organizerId: string, id: string) {
    await this.assertOrganizer(organizerId);
    const event = await this.prisma.event.findFirst({
      where: { id, organizerId },
      include: eventInclude,
    });
    if (!event)
      throw new NotFoundException('Evento do organizador não encontrado.');
    if (event.ticketTypes.length === 0) {
      throw new BadRequestException('Configure ingressos antes de publicar.');
    }
    const published = await this.prisma.event.update({
      where: { id },
      data: { status: 'PUBLISHED' },
      include: eventInclude,
    });
    return this.toResponse(published);
  }

  async update(organizerId: string, id: string, input: CreateEventInput) {
    await this.assertOrganizer(organizerId);
    const current = await this.prisma.event.findFirst({
      where: { id, organizerId },
      include: eventInclude,
    });
    if (!current)
      throw new NotFoundException('Evento do organizador não encontrado.');
    if (
      current.ticketTypes.some((type) => type.sold > 0 || type.reserved > 0)
    ) {
      throw new ConflictException(
        'Não é possível alterar ingressos depois do início das vendas.',
      );
    }

    const startsAt = new Date(input.startsAt);
    const ticketTypes = input.ticketTypes ?? [];
    this.validateInput(input, startsAt, ticketTypes);
    this.validateSeatMap(input);

    const updated = await this.prisma.$transaction(async (transaction) => {
      await transaction.ticketType.deleteMany({ where: { eventId: id } });
      await transaction.seat.deleteMany({ where: { eventId: id } });
      return transaction.event.update({
        where: { id },
        data: {
          title: input.title.trim(),
          description: input.description.trim(),
          category: input.category ?? current.category,
          ticketingMode: input.ticketingMode ?? current.ticketingMode,
          coverUrl: input.coverUrl?.trim() || null,
          venueName: input.venueName.trim(),
          address: input.address.trim(),
          city: input.city.trim(),
          state: input.state.trim().toUpperCase(),
          startsAt,
          ticketTypes: {
            create: ticketTypes.map((type) => ({
              name: type.name.trim(),
              description: type.description?.trim() || null,
              price: Number(type.price),
              capacity: Number(type.capacity),
            })),
          },
          seats:
            input.ticketingMode === 'RESERVED_SEATING' && input.seatMap
              ? {
                  create: this.buildSeats(
                    input.seatMap.rows,
                    input.seatMap.columns,
                  ),
                }
              : undefined,
        },
        include: eventInclude,
      });
    });
    return this.toResponse(updated);
  }

  async remove(organizerId: string, id: string) {
    await this.assertOrganizer(organizerId);
    const event = await this.prisma.event.findFirst({
      where: { id, organizerId },
      include: {
        _count: { select: { orders: true, tickets: true, validations: true } },
      },
    });
    if (!event)
      throw new NotFoundException('Evento do organizador não encontrado.');
    if (
      event._count.orders ||
      event._count.tickets ||
      event._count.validations
    ) {
      throw new ConflictException(
        'Eventos com pedidos, ingressos ou validações não podem ser excluídos.',
      );
    }
    await this.prisma.event.delete({ where: { id } });
    return { message: 'Evento excluído com sucesso.' };
  }

  private async assertOrganizer(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, status: true },
    });
    if (
      !user ||
      user.status !== 'ACTIVE' ||
      (user.role !== 'ORGANIZER' && user.role !== 'ADMIN')
    ) {
      throw new ForbiddenException(
        'Apenas organizadores ativos podem gerenciar eventos.',
      );
    }
  }

  private validateInput(
    input: CreateEventInput,
    startsAt: Date,
    ticketTypes: CreateTicketTypeInput[],
  ) {
    if (
      !input.title?.trim() ||
      !input.description?.trim() ||
      !input.venueName?.trim() ||
      !input.address?.trim() ||
      !input.city?.trim() ||
      !input.state?.trim() ||
      Number.isNaN(startsAt.getTime())
    ) {
      throw new BadRequestException(
        'Preencha os dados obrigatórios do evento.',
      );
    }
    if (
      ticketTypes.length === 0 ||
      ticketTypes.some(
        (type) =>
          !type.name?.trim() ||
          !Number.isFinite(Number(type.price)) ||
          Number(type.price) <= 0 ||
          !Number.isInteger(Number(type.capacity)) ||
          Number(type.capacity) <= 0,
      )
    ) {
      throw new BadRequestException(
        'Informe ao menos um tipo com preço e capacidade positivos.',
      );
    }
  }

  private validateSeatMap(input: CreateEventInput) {
    if (input.ticketingMode !== 'RESERVED_SEATING') return;
    const rows = Number(input.seatMap?.rows);
    const columns = Number(input.seatMap?.columns);
    if (
      !Number.isInteger(rows) ||
      !Number.isInteger(columns) ||
      rows < 1 ||
      rows > 26 ||
      columns < 1 ||
      columns > 50
    ) {
      throw new BadRequestException(
        'O mapa deve ter entre 1 e 26 fileiras e até 50 assentos por fileira.',
      );
    }
    const capacity = input.ticketTypes.reduce(
      (total, type) => total + Number(type.capacity),
      0,
    );
    if (capacity !== rows * columns) {
      throw new BadRequestException(
        'A capacidade deve ser igual à quantidade de assentos do mapa.',
      );
    }
  }

  private buildSeats(rows: number, columns: number) {
    return Array.from({ length: rows * columns }, (_, index) => {
      const rowIndex = Math.floor(index / columns);
      const number = (index % columns) + 1;
      const row = String.fromCharCode(65 + rowIndex);
      return { row, number, label: `${row}${number}` };
    });
  }

  private toResponse(event: any) {
    const ticketTypes = event.ticketTypes.map((type: any) => ({
      ...type,
      price: Number(type.price),
      available: Math.max(0, type.capacity - type.reserved - type.sold),
    }));
    const prices = ticketTypes.map((type: any) => type.price);
    const seats = event.seats.map((seat: any) => ({
      id: seat.id,
      row: seat.row,
      number: seat.number,
      label: seat.label,
      blocked: seat.blocked,
      occupied: seat.blocked || seat._count.orderItems > 0,
    }));
    return {
      ...event,
      ticketTypes,
      seats,
      minPrice: prices.length ? Math.min(...prices) : 0,
      maxPrice: prices.length ? Math.max(...prices) : 0,
      capacity: ticketTypes.reduce(
        (total: number, type: any) => total + type.capacity,
        0,
      ),
      sold: ticketTypes.reduce(
        (total: number, type: any) => total + type.sold,
        0,
      ),
    };
  }

  private isUniqueConstraintError(error: unknown) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2002'
    );
  }
}
