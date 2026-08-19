import { Module } from '@nestjs/common';
import { CatalogEventsController } from './catalog-events.controller';
import { CatalogEventsService } from './catalog-events.service';

@Module({
  controllers: [CatalogEventsController],
  providers: [CatalogEventsService],
})
export class CatalogEventsModule {}
