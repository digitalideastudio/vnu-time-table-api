import { Controller, Get } from '@nestjs/common';
import FacultyService from './faculty.service';
import Faculty from './faculty.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('faculties')
@Controller('faculties')
export default class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @ApiOperation({ summary: 'Get all faculties' })
  @ApiResponse({
    status: 200,
    description: 'List of all faculties',
    type: Faculty,
    isArray: true,
  })
  @Get()
  async findAll(): Promise<Faculty[]> {
    return this.facultyService.findAll();
  }
}
