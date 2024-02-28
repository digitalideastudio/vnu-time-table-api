import { Module } from '@nestjs/common';
import NotificationService from './notification.service';

@Module({
  controllers: [],
  exports: [NotificationService],
  imports: [],
  providers: [NotificationService],
})
export class NotificationModule {}
