import { EntityRepository } from '@mikro-orm/sqlite';
import Ticket from './ticket.entity';

export default class TicketRepository extends EntityRepository<Ticket> {}
