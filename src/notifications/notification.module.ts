import { Module } from '@nestjs/common';
import NotificationService from './notification.service';
import { ConfigModule } from '@nestjs/config';
import { MailgunModule } from 'nestjs-mailgun';

@Module({
  controllers: [],
  exports: [NotificationService],
  imports: [
    ConfigModule.forRoot(),
    MailgunModule.forRoot({
      username: process.env.MAILGUN_USERNAME,
      key: process.env.MAILGUN_API_KEY,
      url: process.env.MAILGUN_URL,
      public_key: process.env.MAILGUN_PUBLIC_KEY,
    }),
  ],
  providers: [NotificationService],
})
export class NotificationModule {}
