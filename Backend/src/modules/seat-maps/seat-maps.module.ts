import { Module } from '@nestjs/common';
import { SeatMapsController } from './seat-maps.controller';
import { SeatMapsService } from './seat-maps.service';

@Module({
  controllers: [SeatMapsController],
  providers: [SeatMapsService]
})
export class SeatMapsModule {}
