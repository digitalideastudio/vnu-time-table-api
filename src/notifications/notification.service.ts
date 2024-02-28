import { Injectable } from '@nestjs/common';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { EntityManager } from '@mikro-orm/core';
import Ticket from './ticket.entity';

@Injectable()
export default class NotificationService {
  private expo: Expo;
  // private tickets: ExpoPushTicket[] = [];

  constructor(private readonly em: EntityManager) {
    this.expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
  }

  public async sendPush(expoPushToken: string, message: string) {
    if (!Expo.isExpoPushToken(expoPushToken)) {
      console.error(
        `Push token ${expoPushToken} is not a valid Expo push token`,
      );

      throw new Error('Invalid push token');
    }

    const messages: ExpoPushMessage[] = [
      {
        to: expoPushToken,
        sound: 'default',
        body: message,
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
        this.em.persist(ticket);
      });
    }
  }
}
