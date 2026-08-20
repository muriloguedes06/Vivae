import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  findMine(ownerId: string) {
    return this.prisma.ticket.findMany({
      where: { ownerId },
      orderBy: { issuedAt: 'desc' },
      select: {
        id: true,
        code: true,
        status: true,
        holderName: true,
        issuedAt: true,
        usedAt: true,
        event: {
          select: {
            id: true,
            title: true,
            category: true,
            coverUrl: true,
            venueName: true,
            address: true,
            city: true,
            state: true,
            startsAt: true,
            endsAt: true,
          },
        },
        ticketType: { select: { name: true } },
        order: { select: { code: true } },
        seat: { select: { label: true } },
      },
    });
  }

  async findMineById(ownerId: string, id: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id, ownerId },
      select: {
        id: true,
        code: true,
        qrToken: true,
        shareToken: true,
        status: true,
        holderName: true,
        issuedAt: true,
        usedAt: true,
        event: {
          select: {
            id: true,
            title: true,
            category: true,
            coverUrl: true,
            venueName: true,
            address: true,
            city: true,
            state: true,
            startsAt: true,
            endsAt: true,
          },
        },
        ticketType: { select: { name: true } },
        order: { select: { code: true } },
        seat: { select: { label: true } },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ingresso não encontrado.');
    }

    return ticket;
  }

  async findShared(shareToken: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { shareToken },
      select: {
        id: true,
        code: true,
        qrToken: true,
        status: true,
        holderName: true,
        issuedAt: true,
        usedAt: true,
        event: {
          select: {
            id: true,
            title: true,
            category: true,
            coverUrl: true,
            venueName: true,
            address: true,
            city: true,
            state: true,
            startsAt: true,
            endsAt: true,
          },
        },
        ticketType: { select: { name: true } },
        order: { select: { code: true } },
        seat: { select: { label: true } },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Link de ingresso inválido.');
    }

    return ticket;
  }
}
