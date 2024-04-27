import { Injectable } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { EntityManager } from '@mikro-orm/core';
import Ticket from './ticket.entity';
import { MailgunMessageData, MailgunService } from 'nestjs-mailgun';
import { I18nService } from 'nestjs-i18n';
import { I18nTranslations } from '../generated/i18n.generated';

export enum NotificationType {
  MOTIVATION = 'MOTIVATION',
  TIMETABLE = 'TIMETABLE',
}

@Injectable()
export default class NotificationService {
  private expo: Expo;
  // private tickets: ExpoPushTicket[] = [];

  constructor(
    private readonly em: EntityManager,
    private mailgunService: MailgunService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {
    this.expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
  }

  public async sendPush(
    expoPushToken: string,
    message: string,
    type: NotificationType,
  ) {
    if (!Expo.isExpoPushToken(expoPushToken)) {
      console.error(
        `Push token ${expoPushToken} is not a valid Expo push token`,
      );

      return;
    }

    const messages: ExpoPushMessage[] = [
      {
        to: expoPushToken,
        sound: 'default',
        body: message,
        badge: 1,
        data: {
          type,
          message,
        },
      },
    ];

    console.log('Sending push notification to expo:', messages);

    const chunks = this.expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      const ticketChunks = await this.expo.sendPushNotificationsAsync(chunk);

      console.log('Ticket chunk:', ticketChunks);

      // Store the tickets for later use in DB
      ticketChunks.forEach((t) => {
        const ticket = new Ticket(t, message, expoPushToken);
        this.em.fork().persist(ticket);
      });
    }
  }

  async sendEmailConfirmation(email: string, code: string, lang: string) {
    console.log(`Sending email confirmation to ${email} with code ${code}`);

    const data: MailgunMessageData = {
      from: process.env.MAILGUN_FROM_EMAIL,
      to: email,
      subject: this.i18n.t('email-confirmation.subject', { lang }),
      html: this.i18n.t('email-confirmation.text', { lang, args: { code } }),
      'o:testmode': 'no',
      'h:X-Mailgun-Variables': '{"key":"value"}',
    };

    await this.mailgunService.createEmail(process.env.MAILGUN_DOMAIN, data);

    return true;
  }
}
