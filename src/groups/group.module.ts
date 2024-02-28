import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import GroupController from './group.controller';
import GroupService from './group.service';
import Group from './group.entity';
import { SharedModule } from '../shared/shared.module';

@Module({
  controllers: [GroupController],
  exports: [GroupService],
  imports: [MikroOrmModule.forFeature({ entities: [Group] }), SharedModule],
  providers: [GroupService],
})
export class GroupModule {}
