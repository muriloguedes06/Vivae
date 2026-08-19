import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { CatalogEventsModule } from './modules/catalog-events/catalog-events.module';
import { EventsModule } from './modules/events/events.module';
import { VenuesModule } from './modules/venues/venues.module';
import { EventSessionsModule } from './modules/event-sessions/event-sessions.module';
import { TicketingModule } from './modules/ticketing/ticketing.module';
import { SeatMapsModule } from './modules/seat-maps/seat-maps.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { GateModule } from './modules/gate/gate.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    UsersModule,
    CatalogEventsModule,
    EventsModule,
    VenuesModule,
    EventSessionsModule,
    TicketingModule,
    SeatMapsModule,
    OrdersModule,
    PaymentsModule,
    TicketsModule,
    GateModule,
  ],
})
export class AppModule {}
