import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import Student from './student.entity';
import StudentService from './student.service';
import StudentController from './student.controller';
import { FacultyModule } from '../faculties/faculty.module';
import { GroupModule } from '../groups/group.module';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  controllers: [StudentController],
  exports: [StudentService],
  imports: [
    MikroOrmModule.forFeature({ entities: [Student] }),
    FacultyModule,
    GroupModule,
    NotificationModule,
  ],
  providers: [StudentService],
})
export class StudentModule {}
