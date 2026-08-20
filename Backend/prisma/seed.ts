import { Prisma, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Teste@123', 10);

  const organizer = await prisma.user.upsert({
    where: { email: 'organizador@vivae.test' },
    update: {
      username: 'organizador',
      lastname: 'Vivae',
      password,
      role: 'ORGANIZER',
      status: 'ACTIVE',
    },
    create: {
      username: 'organizador',
      lastname: 'Vivae',
      email: 'organizador@vivae.test',
      password,
      role: 'ORGANIZER',
    },
  });

  await prisma.user.upsert({
    where: { email: 'cliente1@vivae.test' },
    update: {
      username: 'cliente01',
      lastname: 'Silva',
      password,
      role: 'CUSTOMER',
      status: 'ACTIVE',
    },
    create: {
      username: 'cliente01',
      lastname: 'Silva',
      email: 'cliente1@vivae.test',
      password,
      role: 'CUSTOMER',
    },
  });

  await prisma.user.upsert({
    where: { email: 'cliente2@vivae.test' },
    update: {
      username: 'cliente02',
      lastname: 'Santos',
      password,
      role: 'CUSTOMER',
      status: 'ACTIVE',
    },
    create: {
      username: 'cliente02',
      lastname: 'Santos',
      email: 'cliente2@vivae.test',
      password,
      role: 'CUSTOMER',
    },
  });

  await prisma.user.upsert({
    where: { email: 'portaria@vivae.test' },
    update: {
      username: 'portaria01',
      lastname: 'Vivae',
      password,
      role: 'GATE_STAFF',
      status: 'ACTIVE',
    },
    create: {
      username: 'portaria01',
      lastname: 'Vivae',
      email: 'portaria@vivae.test',
      password,
      role: 'GATE_STAFF',
    },
  });

  const event = await prisma.event.upsert({
    where: { id: 'seed-movie-event' },
    update: {
      organizerId: organizer.id,
      status: 'PUBLISHED',
      startsAt: new Date('2027-12-20T21:00:00.000Z'),
      endsAt: new Date('2027-12-20T23:30:00.000Z'),
    },
    create: {
      id: 'seed-movie-event',
      organizerId: organizer.id,
      externalSource: 'SEED',
      externalId: 'demo-movie',
      title: 'Sessão de Demonstração',
      description:
        'Evento publicado pelo seed para demonstrar reserva de assento, pagamento, QR Code e validação na portaria.',
      category: 'MOVIE',
      status: 'PUBLISHED',
      ticketingMode: 'RESERVED_SEATING',
      venueName: 'Cine Vivaê',
      address: 'Avenida Principal, 100',
      city: 'São Paulo',
      state: 'SP',
      startsAt: new Date('2027-12-20T21:00:00.000Z'),
      endsAt: new Date('2027-12-20T23:30:00.000Z'),
    },
  });

  await prisma.ticketType.upsert({
    where: {
      eventId_name: {
        eventId: event.id,
        name: 'Inteira',
      },
    },
    update: {
      price: 40,
      capacity: 40,
      active: true,
    },
    create: {
      eventId: event.id,
      name: 'Inteira',
      description: 'Ingresso de demonstração',
      price: 40,
      capacity: 40,
    },
  });

  const seats: Prisma.SeatCreateManyInput[] = [];

  for (let rowIndex = 0; rowIndex < 5; rowIndex += 1) {
    const row = String.fromCharCode(65 + rowIndex);

    for (let number = 1; number <= 8; number += 1) {
      seats.push({
        eventId: event.id,
        row,
        number,
        label: `${row}${number}`,
      });
    }
  }

  await prisma.seat.createMany({
    data: seats,
    skipDuplicates: true,
  });

  console.log('Seed concluído.');
  console.log('Senha de todas as contas: Teste@123');
  console.log('Organizador: organizador@vivae.test');
  console.log('Clientes: cliente1@vivae.test e cliente2@vivae.test');
  console.log('Portaria: portaria@vivae.test');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
