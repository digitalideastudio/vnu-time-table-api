import { EntityRepository } from '@mikro-orm/sqlite';
import Student from './student.entity';

export default class StudentRepository extends EntityRepository<Student> {}
