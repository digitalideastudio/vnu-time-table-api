import { Module } from '@nestjs/common';
import TimetableService from './timetable.service';
import TimetableController from './timetable.controller';
import { GroupModule } from '../groups/group.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  controllers: [TimetableController],
  exports: [TimetableService],
  imports: [GroupModule, SharedModule],
  providers: [TimetableService],
})
export class TimetableModule {}
