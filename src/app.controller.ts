import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService, Faculty } from './app.service';
import UserDto from './user.dto';

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

  /**
   * Register push token
   *
   * @param user
   */
  @Post('/register-user')
  async registerUser(@Body() user: UserDto) {
    console.log(user);
    return this.appService.registerUser(user);
  }

  @Get('/users')
  getUsers() {
    return this.appService.users;
  }

  /**
   * Send push notification by user uuid (message as a body, uuid as a query param)
   *
   * @param message
   * @param {string} uuid
   *
   */
  @Post('/send-push-notification')
  async sendPushNotification(
    @Body('message') message: string,
    @Query('uuid') uuid: string,
  ) {
    return this.appService.sendPushNotification(message, uuid);
  }

  @Post('/timetable')
  async getTimetable(
    @Body('startDate') startDate: string,
    @Body('endDate') endDate: string,
    @Body('group') group: string,
  ) {
    return this.appService.getTimetable(startDate, endDate, group);
  }
}
