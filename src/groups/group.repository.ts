import { EntityRepository } from '@mikro-orm/sqlite';
import Group from './group.entity';

export default class GroupRepository extends EntityRepository<Group> {}
