import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import FacultyController from './faculty.controller';
import FacultyService from './faculty.service';
import Faculty from './faculty.entity';

@Module({
  controllers: [FacultyController],
  exports: [FacultyService],
  imports: [MikroOrmModule.forFeature({ entities: [Faculty] })],
  providers: [FacultyService],
})
export class FacultyModule {}
