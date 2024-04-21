import StudentService from './student.service';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import CreateStudentDto from './dto/create-student.dto';
import Student from './student.entity';
import UpdateStudentDto from './dto/update-student.dto';
import { NotificationType } from '../notifications/notification.service';

@ApiBearerAuth()
@ApiTags('students')
@Controller('students')
export default class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @ApiOperation({ summary: 'Register a student' })
  @ApiResponse({
    status: 201,
    description: 'A new student has been successfully registered',
  })
  @ApiResponse({
    status: 304,
    description: 'Student has been successfully retrieved',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  async register(@Body() studentData: CreateStudentDto) {
    return this.studentService.register(studentData);
  }

  @ApiOperation({ summary: 'Update student data' })
  @ApiResponse({
    status: 200,
    description: 'Student has been successfully updated',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Put()
  async update(@Body() studentData: UpdateStudentDto) {
    return this.studentService.update(studentData);
  }

  @ApiOperation({ summary: 'Delete a student' })
  @ApiResponse({
    status: 200,
    description: 'Student has been successfully deleted',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Delete()
  async delete(@Query('studentId') studentId: number) {
    return this.studentService.delete(studentId);
  }

  @ApiOperation({ summary: 'Get all students' })
  @ApiResponse({
    status: 200,
    description: 'List of all students',
    type: Student,
    isArray: true,
  })
  @Get()
  async findAll(): Promise<Student[]> {
    return this.studentService.findAll();
  }

  @ApiOperation({ summary: 'Send push notification to a student' })
  @ApiResponse({
    status: 200,
    description: 'Push notification has been successfully sent',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('/send-push-notification')
  async sendPushNotification(
    @Body('message') message: string,
    @Query('studentId') studentId: number,
    @Query('type') type: NotificationType,
  ) {
    return this.studentService.sendPushNotification(studentId, message, type);
  }

  @ApiOperation({ summary: 'Confirm email' })
  @ApiResponse({
    status: 200,
    description: 'Email has been successfully confirmed',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('/confirm-email')
  async confirmEmail(@Body('email') email: string, @Body('code') code: string) {
    return this.studentService.confirmEmail(email, code);
  }

  @ApiOperation({
    summary: 'Send random motivation for all or specific students',
  })
  @ApiResponse({
    status: 200,
    description: 'Motivation has been successfully sent',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('/send-random-motivation')
  async sendMotivation(@Body('studentIds') studentIds: number[]) {
    return this.studentService.sendRandomMotivation(studentIds);
  }

  @ApiOperation({ summary: 'Get student by email' })
  @ApiResponse({
    status: 200,
    description: 'Student has been successfully found',
  })
  @ApiResponse({ status: 404, description: 'Student not found' })
  @Get()
  async findByEmail(@Query('email') email: string) {
    return this.studentService.findByEmail(email);
  }

  @ApiOperation({ summary: 'Get student motivations' })
  @ApiResponse({
    status: 200,
    description: 'List of student motivations',
    type: Student,
    isArray: true,
  })
  @Get(':id/motivations')
  async getMotivations(@Param('id') id: number) {
    return this.studentService.getMotivations(id);
  }
}
