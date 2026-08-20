import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type Ticket } from '@prisma/client';
import { randomBytes, randomUUID } from 'node:crypto';
import { PrismaService } from '../../prisma/prisma.service';

export interface SimulatePaymentInput {
  orderId: string;
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async simulate(userId: string, input: SimulatePaymentInput) {
    if (
      !input.orderId ||
      !input.cardholderName ||
      !input.cardNumber ||
      !input.expiry ||
      !input.cvv
    ) {
      throw new BadRequestException(
        'Preencha todos os dados do pagamento simulado.',
      );
    }

    const order = await this.prisma.order.findFirst({
      where: {
        id: input.orderId,
        userId,
      },
      include: {
        items: true,
        payments: true,
        user: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado.');
    }

    if (order.status !== 'PENDING') {
      throw new ConflictException('Este pedido já foi processado.');
    }

    if (order.expiresAt && order.expiresAt <= new Date()) {
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
          where: {
            id: order.id,
          },
          data: {
            status: 'EXPIRED',
          },
        });
      });

      throw new ConflictException(
        'A reserva expirou. Selecione os ingressos novamente.',
      );
    }

    const approved =
      input.cardholderName.trim().toLocaleLowerCase('pt-BR') ===
        'murilo guedes' &&
      input.cardNumber.replace(/\D/g, '') === '4242424242424242' &&
      input.expiry.replace(/\s/g, '') === '01/35' &&
      input.cvv.replace(/\D/g, '') === '426';

    return this.prisma.$transaction(
      async (transaction) => {
        const current = await transaction.order.findFirst({
          where: {
            id: order.id,
            userId,
            status: 'PENDING',
          },
        });

        if (!current) {
          throw new ConflictException('O pedido já foi processado.');
        }

        const payment = await transaction.payment.create({
          data: {
            orderId: order.id,
            amount: order.total,
            status: approved ? 'APPROVED' : 'DECLINED',
            failureReason: approved
              ? null
              : 'Dados diferentes do cartão de teste.',
            processedAt: new Date(),
          },
        });

        if (!approved) {
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
            where: {
              id: order.id,
            },
            data: {
              status: 'CANCELLED',
            },
          });

          return { approved: false, payment, tickets: [] };
        }

        for (const item of order.items) {
          await transaction.ticketType.update({
            where: { id: item.ticketTypeId },
            data: {
              reserved: { decrement: item.quantity },
              sold: { increment: item.quantity },
            },
          });
        }

        const tickets: Ticket[] = [];
        for (const item of order.items) {
          for (let index = 0; index < item.quantity; index += 1) {
            tickets.push(
              await transaction.ticket.create({
                data: {
                  orderId: order.id,
                  orderItemId: item.id,
                  ownerId: userId,
                  eventId: order.eventId,
                  ticketTypeId: item.ticketTypeId,
                  seatId: item.seatId,
                  code: `VIV-${randomUUID().slice(0, 8).toUpperCase()}`,
                  qrToken: randomBytes(32).toString('base64url'),
                  shareToken: randomBytes(32).toString('base64url'),
                  holderName:
                    `${order.user.username} ${order.user.lastname ?? ''}`.trim(),
                },
              }),
            );
          }
        }

        await transaction.order.update({
          where: {
            id: order.id,
          },
          data: {
            status: 'PAID',
            paidAt: new Date(),
          },
        });

        return { approved: true, payment, tickets };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async findByOrder(userId: string, orderId: string) {
    const payments = await this.prisma.payment.findMany({
      where: {
        orderId,
        order: {
          userId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!payments.length) {
      throw new NotFoundException('Pagamento não encontrado.');
    }

    return payments;
  }
}
