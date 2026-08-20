import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { CatalogEventsModule } from './modules/catalog-events/catalog-events.module';
import { EventsModule } from './modules/events/events.module';
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
    OrdersModule,
    PaymentsModule,
    TicketsModule,
    GateModule,
  ],
})
export class AppModule {}
