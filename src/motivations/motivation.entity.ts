import {
  Collection,
  Entity,
  EntityDTO,
  EntityRepositoryType,
  ManyToMany,
  PrimaryKey,
  Property,
  wrap,
} from '@mikro-orm/core';
import MotivationRepository from './motivation.repository';
import { ApiProperty } from '@nestjs/swagger';
import Student from '../students/student.entity';

@Entity({ repository: () => MotivationRepository })
export default class Motivation {
  [EntityRepositoryType]?: MotivationRepository;

  @PrimaryKey()
  id: number;

  @ApiProperty({
    example: 'Have a good time',
    description: 'The text of the motivation',
  })
  @Property({
    type: 'text',
  })
  text: string;

  @ManyToMany({ inversedBy: 'motivations' })
  recipients = new Collection<Student>(this);

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  constructor(text: string) {
    this.text = text;
  }

  public toJSON() {
    return wrap<Motivation>(this).toObject() as EntityDTO<Motivation>;
  }
}
