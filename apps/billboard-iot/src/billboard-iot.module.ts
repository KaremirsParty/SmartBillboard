import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AdDisplayModule } from './ad-display/ad-display.module';
import { BillboardIotController } from './billboard-iot.controller';
import { BillboardIotService } from './billboard-iot.service';
import { RemoteControlModule } from './remote-control/remote-control.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    EventEmitterModule.forRoot({
      delimiter: '.',
    }),
    RemoteControlModule,
    AdDisplayModule,
  ],
  controllers: [BillboardIotController],
  providers: [BillboardIotService],
})
export class BillboardIotModule {}
