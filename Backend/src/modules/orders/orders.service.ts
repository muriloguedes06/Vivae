import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';

interface CreateOrderItemInput {
  ticketTypeId: string;
  quantity?: number;
  seatIds?: string[];
}

export interface CreateOrderInput {
  eventId: string;
  items: CreateOrderItemInput[];
}

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, input: CreateOrderInput) {
    if (!input.eventId || !input.items?.length) {
      throw new BadRequestException('Evento e ingressos são obrigatórios.');
    }

    const event = await this.prisma.event.findFirst({
      where: {
        id: input.eventId,
        status: 'PUBLISHED',
      },
      include: {
        ticketTypes: {
          where: {
            active: true,
          },
        },
        seats: true,
      },
    });

    if (!event) {
      throw new NotFoundException('Evento publicado não encontrado.');
    }

    const requestedTypeIds = [
      ...new Set(input.items.map((item) => item.ticketTypeId)),
    ];
    const types = event.ticketTypes.filter((type) =>
      requestedTypeIds.includes(type.id),
    );
    if (types.length !== requestedTypeIds.length) {
      throw new BadRequestException(
        'Tipo de ingresso inválido para este evento.',
      );
    }

    const itemData: Array<{
      ticketTypeId: string;
      seatId?: string;
      description: string;
      quantity: number;
      unitPrice: Prisma.Decimal;
      subtotal: Prisma.Decimal;
    }> = [];
    const quantities = new Map<string, number>();

    for (const item of input.items) {
      const type = types.find(
        (candidate) => candidate.id === item.ticketTypeId,
      )!;

      if (event.ticketingMode === 'RESERVED_SEATING') {
        const seatIds = [...new Set(item.seatIds ?? [])];

        if (!seatIds.length || seatIds.length > 6) {
          throw new BadRequestException('Escolha entre 1 e 6 assentos.');
        }

        const seats = event.seats.filter(
          (seat) => seatIds.includes(seat.id) && !seat.blocked,
        );

        if (seats.length !== seatIds.length) {
          throw new BadRequestException('Um ou mais assentos são inválidos.');
        }

        for (const seat of seats) {
          itemData.push({
            ticketTypeId: type.id,
            seatId: seat.id,
            description: `${type.name} · Assento ${seat.label}`,
            quantity: 1,
            unitPrice: type.price,
            subtotal: type.price,
          });
        }
        quantities.set(type.id, (quantities.get(type.id) ?? 0) + seats.length);
      } else {
        const quantity = Number(item.quantity);

        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 6) {
          throw new BadRequestException('A quantidade deve estar entre 1 e 6.');
        }

        itemData.push({
          ticketTypeId: type.id,
          description: `${type.name} × ${quantity}`,
          quantity,
          unitPrice: type.price,
          subtotal: type.price.mul(quantity),
        });
        quantities.set(type.id, (quantities.get(type.id) ?? 0) + quantity);
      }
    }

    const totalQuantity = itemData.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    if (totalQuantity < 1 || totalQuantity > 6) {
      throw new BadRequestException(
        'O pedido deve conter entre 1 e 6 ingressos.',
      );
    }

    const total = itemData.reduce(
      (sum, item) => sum.add(item.subtotal),
      new Prisma.Decimal(0),
    );

    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          for (const [ticketTypeId, quantity] of quantities) {
            const type = await transaction.ticketType.findUnique({
              where: {
                id: ticketTypeId,
              },
            });

            if (!type || type.capacity - type.sold - type.reserved < quantity) {
              throw new ConflictException('Ingressos insuficientes.');
            }

            await transaction.ticketType.update({
              where: {
                id: ticketTypeId,
              },
              data: {
                reserved: {
                  increment: quantity,
                },
              },
            });
          }

          return transaction.order.create({
            data: {
              userId,
              eventId: event.id,
              code: `ORD-${randomUUID().slice(0, 8).toUpperCase()}`,
              total,
              expiresAt: new Date(Date.now() + 10 * 60 * 1000),
              items: {
                create: itemData,
              },
            },
            include: {
              event: true,
              items: {
                include: {
                  seat: true,
                  ticketType: true,
                },
              },
            },
          });
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Um dos assentos acabou de ser reservado.');
      }
      throw error;
    }
  }

  findMine(userId: string) {
    return this.prisma.order.findMany({
      where: {
        userId,
      },
      include: {
        event: true,
        items: {
          include: {
            seat: true,
            ticketType: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findMineById(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        event: true,
        items: {
          include: {
            seat: true,
            ticketType: true,
          },
        },
        payments: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado.');
    }

    return order;
  }

  async cancel(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id,
        userId,
        status: 'PENDING',
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new ConflictException(
        'Pedido não encontrado ou não pode ser cancelado.',
      );
    }

    await this.prisma.$transaction(async (transaction) => {
      for (const item of order.items) {
        await transaction.ticketType.update({
          where: { id: item.ticketTypeId },
          data: { reserved: { decrement: item.quantity } },
        });
      }

      await transaction.orderItem.updateMany({
        where: { id: { in: order.items.map((item) => item.id) } },
        data: { seatId: null },
      });

      await transaction.order.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });
    });

    return { message: 'Pedido cancelado e reserva liberada.' };
  }
}
