import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GateService {
  constructor(private readonly prisma: PrismaService) {}

  async validate(code: string, expectedEventId: string, operatorId: string) {
    const normalizedCode = code?.trim();

    if (!normalizedCode || !expectedEventId) {
      throw new BadRequestException('Informe o evento e o código do ingresso.');
    }

    const expectedEvent = await this.prisma.event.findFirst({
      where: {
        id: expectedEventId,
        status: 'PUBLISHED',
      },
    });

    if (!expectedEvent) {
      throw new BadRequestException('Evento da portaria não encontrado.');
    }

    const ticket = await this.prisma.ticket.findFirst({
      where: {
        OR: [
          { code: { equals: normalizedCode, mode: 'insensitive' } },
          { qrToken: normalizedCode },
        ],
      },
      include: { event: true, ticketType: true },
    });

    if (!ticket) {
      return {
        valid: false,
        status: 'INVALID',
        message: 'Código não encontrado.',
        code: normalizedCode,
      };
    }

    if (ticket.eventId !== expectedEventId) {
      await this.prisma.ticketValidation.create({
        data: {
          eventId: expectedEventId,
          ticketId: ticket.id,
          operatorId,
          scannedCode: normalizedCode,
          status: 'WRONG_EVENT',
          reason: `Ingresso pertence ao evento ${ticket.event.title}.`,
        },
      });

      return {
        valid: false,
        status: 'WRONG_EVENT',
        message: 'Este ingresso pertence a outro evento.',
        eventName: ticket.event.title,
        participantName: ticket.holderName,
        ticketType: ticket.ticketType.name,
        expiresAt: ticket.event.endsAt ?? ticket.event.startsAt,
        code: ticket.code,
      };
    }

    if (ticket.status === 'USED') {
      await this.prisma.ticketValidation.create({
        data: {
          eventId: ticket.eventId,
          ticketId: ticket.id,
          operatorId,
          scannedCode: normalizedCode,
          status: 'ALREADY_USED',
          reason: 'Ingresso já utilizado.',
        },
      });

      return {
        valid: false,
        status: 'ALREADY_USED',
        message: 'Este ingresso já foi utilizado.',
        eventName: ticket.event.title,
        participantName: ticket.holderName,
        ticketType: ticket.ticketType.name,
        expiresAt: ticket.event.endsAt ?? ticket.event.startsAt,
        code: ticket.code,
      };
    }

    if (
      ticket.status === 'CANCELLED' ||
      ['CANCELLED', 'FINISHED'].includes(ticket.event.status)
    ) {
      await this.prisma.ticketValidation.create({
        data: {
          eventId: ticket.eventId,
          ticketId: ticket.id,
          operatorId,
          scannedCode: normalizedCode,
          status: 'CANCELLED_TICKET',
          reason: 'Ingresso ou evento cancelado/encerrado.',
        },
      });

      return {
        valid: false,
        status: 'CANCELLED_TICKET',
        message: 'Este ingresso não está mais válido.',
        eventName: ticket.event.title,
        participantName: ticket.holderName,
        ticketType: ticket.ticketType.name,
        expiresAt: ticket.event.endsAt ?? ticket.event.startsAt,
        code: ticket.code,
      };
    }

    const consumed = await this.prisma.$transaction(async (transaction) => {
      const update = await transaction.ticket.updateMany({
        where: {
          id: ticket.id,
          status: 'ACTIVE',
        },
        data: {
          status: 'USED',
          usedAt: new Date(),
        },
      });

      if (update.count === 0) {
        await transaction.ticketValidation.create({
          data: {
            eventId: ticket.eventId,
            ticketId: ticket.id,
            operatorId,
            scannedCode: normalizedCode,
            status: 'ALREADY_USED',
            reason: 'Ingresso já utilizado.',
          },
        });

        return false;
      }

      await transaction.ticketValidation.create({
        data: {
          eventId: ticket.eventId,
          ticketId: ticket.id,
          operatorId,
          scannedCode: normalizedCode,
          status: 'VALID',
        },
      });

      return true;
    });

    if (!consumed) {
      return {
        valid: false,
        status: 'ALREADY_USED',
        message: 'Este ingresso já foi utilizado.',
        eventName: ticket.event.title,
        participantName: ticket.holderName,
        ticketType: ticket.ticketType.name,
        expiresAt: ticket.event.endsAt ?? ticket.event.startsAt,
        code: ticket.code,
      };
    }

    return {
      valid: true,
      status: 'VALID',
      message: 'Acesso liberado.',
      eventName: ticket.event.title,
      participantName: ticket.holderName,
      ticketType: ticket.ticketType.name,
      expiresAt: ticket.event.endsAt ?? ticket.event.startsAt,
      code: ticket.code,
    };
  }
}
