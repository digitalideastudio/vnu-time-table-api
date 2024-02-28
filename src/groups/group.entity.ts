import {
  Entity,
  EntityDTO,
  EntityRepositoryType,
  PrimaryKey,
  Property,
  wrap,
} from '@mikro-orm/core';
import GroupRepository from './group.repository';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ repository: () => GroupRepository })
export default class Group {
  [EntityRepositoryType]?: GroupRepository;

  @PrimaryKey()
  id: number;

  @ApiProperty({
    example: '1234',
    description: 'The unique identifier from the university',
  })
  @Property()
  refKey: string;

  @ApiProperty({
    example: '1234',
    description: 'Same as refKey, for the sake of consistency',
  })
  @Property()
  name: string;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  constructor(refKey: string, name: string) {
    this.refKey = refKey;
    this.name = name;
  }

  public toJSON() {
    return wrap<Group>(this).toObject() as EntityDTO<Group>;
  }
}
