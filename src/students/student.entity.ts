import {
  Entity,
  EntityDTO,
  EntityRepositoryType,
  ManyToOne,
  PrimaryKey,
  Property,
  wrap,
} from '@mikro-orm/core';
import StudentRepository from './student.repository';
import Faculty from '../faculties/faculty.entity';
import Group from '../groups/group.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ repository: () => StudentRepository })
export default class Student {
  [EntityRepositoryType]?: StudentRepository;

  @PrimaryKey()
  id: number;

  @ApiProperty({
    example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
    description: 'The token to send push notifications',
  })
  @Property()
  expoPushToken: string;

  @ApiProperty({
    example: 'vasyl.stus@my.edu.ua',
    description: 'The email of the student',
  })
  @Property()
  email: string;

  @ApiProperty({
    example: 1,
    description: 'The unique internal identifier of the faculty',
  })
  @ManyToOne(() => Faculty, { eager: true })
  faculty: Faculty;

  @ApiProperty({
    example: 2023,
    description: 'The year of the student',
  })
  @Property()
  year: number;

  @ApiProperty({
    example: 1,
    description: 'The unique internal identifier of the group',
  })
  @ManyToOne(() => Group, { eager: true })
  group: Group;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property()
  locale: string;

  @Property()
  deviceLocale: string;

  constructor(
    email: string,
    expoPushToken: string,
    faculty: Faculty,
    group: Group,
    year: number,
    locale: string,
    deviceLocale: string,
  ) {
    this.faculty = faculty;
    this.expoPushToken = expoPushToken;
    this.email = email;
    this.year = year;
    this.group = group;
    this.locale = locale;
    this.deviceLocale = deviceLocale;
  }

  public toJSON() {
    const o = wrap<Student>(this).toObject() as EntityDTO<Student>;

    o.faculty = this.faculty.toJSON();
    o.group = this.group.toJSON();

    return o;
  }
}
