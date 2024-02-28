import {
  Entity,
  EntityRepositoryType,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import TicketRepository from './ticket.repository';
import { ExpoPushReceiptId, ExpoPushTicket } from 'expo-server-sdk';

@Entity({ repository: () => TicketRepository })
export default class Ticket {
  [EntityRepositoryType]?: TicketRepository;

  @PrimaryKey()
  public id: number;

  @Property()
  public status: 'ok' | 'error';

  @Property()
  public ticketId: ExpoPushReceiptId;

  @Property()
  public errorType:
    | 'DeviceNotRegistered'
    | 'InvalidCredentials'
    | 'MessageTooBig'
    | 'MessageRateExceeded';

  @Property()
  public errorMessage: string;

  @Property()
  public message: string;

  @Property()
  public expoPushToken: string;

  constructor(t: ExpoPushTicket, message: string, expoPushToken: string) {
    this.status = t.status;
    this.message = message;
    this.expoPushToken = expoPushToken;

    if (t.status === 'ok') {
      this.ticketId = t.id;
    } else {
      this.errorType = t.details.error;
      this.errorMessage = t.message;
    }
  }
}
