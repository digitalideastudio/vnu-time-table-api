import TimetableService from './timetable.service';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import CreateStudentDto from '../students/dto/create-student.dto';
import GetTimetableDto from './dto/get-timetable.dto';

@ApiBearerAuth()
@ApiTags('timetables')
@Controller('timetables')
export default class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @ApiOperation({ summary: 'Get timetable for a group' })
  @ApiResponse({
    status: 200,
    description: 'Timetable for a group',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  async get(@Body('config') config: GetTimetableDto) {
    return this.timetableService.get(config);
  }
}
