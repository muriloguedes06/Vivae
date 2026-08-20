import { Module } from '@nestjs/common';
import { GateController } from './gate.controller';
import { GateService } from './gate.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [GateController],
  providers: [GateService],
})
export class GateModule {}
