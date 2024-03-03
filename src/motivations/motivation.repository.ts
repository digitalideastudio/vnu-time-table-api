import { EntityRepository } from '@mikro-orm/sqlite';
import Motivation from './motivation.entity';

export default class MotivationRepository extends EntityRepository<Motivation> {}
