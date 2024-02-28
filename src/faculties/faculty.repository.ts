import { EntityRepository } from '@mikro-orm/sqlite';
import Faculty from './faculty.entity';

export default class FacultyRepository extends EntityRepository<Faculty> {}
