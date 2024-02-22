import { Controller, Get, Query } from '@nestjs/common';
import { AppService, Faculty } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/faculties')
  getFaculties(): Faculty[] {
    return this.appService.getFaculties();
  }

  @Get('/groups')
  getGroups(
    @Query('facultyId') facultyId: string,
    @Query('studyYear') studyYear: string,
    @Query('search') search: string,
  ) {
    return this.appService.searchGroups(facultyId, studyYear, search);
  }
}
