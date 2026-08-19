import { Module } from '@nestjs/common';
import { EventSessionsController } from './event-sessions.controller';
import { EventSessionsService } from './event-sessions.service';

@Module({
  controllers: [EventSessionsController],
  providers: [EventSessionsService]
})
export class EventSessionsModule {}
