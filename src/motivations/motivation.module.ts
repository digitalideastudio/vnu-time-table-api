import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import MotivationController from './motivation.controller';
import MotivationService from './motivation.service';
import { SharedModule } from '../shared/shared.module';
import Motivation from './motivation.entity';

@Module({
  controllers: [MotivationController],
  exports: [MotivationService],
  imports: [
    MikroOrmModule.forFeature({ entities: [Motivation] }),
    SharedModule,
  ],
  providers: [MotivationService],
})
export class MotivationModule {}
