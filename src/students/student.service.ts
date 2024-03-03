import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { validate } from 'class-validator';
import { EntityManager, wrap } from '@mikro-orm/core';
import UpdateStudentDto from './dto/update-student.dto';
import Student from './student.entity';
import { IStudentRO } from './student.interface';
import CreateStudentDto from './dto/create-student.dto';
import StudentRepository from './student.repository';
import FacultyService from '../faculties/faculty.service';
import GroupService from '../groups/group.service';
import NotificationService, {
  NotificationType,
} from '../notifications/notification.service';
import MotivationService from '../motivations/motivation.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export default class StudentService {
  constructor(
    private readonly studentRepository: StudentRepository,
    private readonly facultyService: FacultyService,
    private readonly groupService: GroupService,
    private readonly notificationService: NotificationService,
    private readonly motivationService: MotivationService,
    private readonly em: EntityManager,
  ) {}

  public async findAll(): Promise<Student[]> {
    return this.studentRepository.findAll();
  }

  public async register(dto: CreateStudentDto): Promise<IStudentRO> {
    const {
      expoPushToken,
      email,
      facultyId,
      year,
      groupId,
      locale,
      deviceLocale,
      enableNotifications,
    } = dto;

    const exists = await this.studentRepository.count({
      $or: [{ email }],
    });

    if (exists > 0) {
      throw new HttpException(
        {
          message: 'ERR_EMAIL_EXISTS',
          errors: { email: 'ERR_EMAIL_EXISTS' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const faculty = await this.facultyService.findOne(facultyId);

    if (!faculty) {
      throw new HttpException(
        {
          message: 'ERR_BAD_INPUT',
          errors: { facultyId: 'ERR_BAD_INPUT' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const group = await this.groupService.findOne(groupId);

    if (!group) {
      throw new HttpException(
        {
          message: 'ERR_BAD_INPUT',
          errors: { groupId: 'ERR_BAD_INPUT' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create new student
    const student = new Student(
      email,
      expoPushToken,
      faculty,
      group,
      year,
      locale,
      deviceLocale,
      enableNotifications,
    );
    const errors = await validate(student);

    if (errors.length > 0) {
      throw new HttpException(
        {
          message: 'ERR_BAD_INPUT',
          errors: { email: 'ERR_BAD_INPUT' },
        },
        HttpStatus.BAD_REQUEST,
      );
    } else {
      await this.em.persistAndFlush(student);
      await this.sendEmailConfirmation(student, email);
      return this.buildStudentRO(student);
    }
  }

  public async update(dto: UpdateStudentDto) {
    const student = await this.studentRepository.findOne(dto.id);

    if (!student) {
      throw new HttpException(
        {
          message: 'ERR_BAD_INPUT',
          errors: { id: 'ERR_BAD_INPUT' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const faculty = await this.facultyService.findOne(dto.facultyId);

    if (!faculty) {
      throw new HttpException(
        {
          message: 'ERR_BAD_INPUT',
          errors: { facultyId: 'ERR_BAD_INPUT' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const group = await this.groupService.findOne(dto.groupId);

    if (!group) {
      throw new HttpException(
        {
          message: 'ERR_BAD_INPUT',
          errors: { groupId: 'ERR_BAD_INPUT' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (dto.email !== student.email || !student.emailConfirmed) {
      await this.sendEmailConfirmation(student, dto.email);
    }

    wrap(student).assign({
      expoPushToken: dto.expoPushToken,
      email: dto.email,
      faculty,
      group,
      year: dto.year,
      locale: dto.locale,
      deviceLocale: dto.deviceLocale,
      enableNotifications: dto.enableNotifications,
    });
    await this.em.flush();

    return this.buildStudentRO(student);
  }

  private buildStudentRO(student: Student) {
    const studentRO = {
      id: student.id,
      expoPushToken: student.expoPushToken,
      email: student.email,
      faculty: student.faculty,
      year: student.year,
      group: student.group,
      locale: student.locale,
      deviceLocale: student.deviceLocale,
      emailConfirmed: student.emailConfirmed,
      enableNotifications: student.enableNotifications,
    };

    return { student: studentRO };
  }

  public async sendPushNotification(
    studentId: number,
    message: string,
    type: NotificationType,
  ) {
    const user = await this.studentRepository.findOne(studentId);

    if (!user) {
      throw new HttpException(
        {
          message: 'ERR_BAD_INPUT',
          errors: { userId: 'ERR_BAD_INPUT' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.notificationService.sendPush(user.expoPushToken, message, type);
  }

  public async delete(studentId: number) {
    const deletedCount = await this.studentRepository.nativeDelete(studentId);

    return {
      status: deletedCount > 0 ? 'success' : 'fail',
    };
  }

  public async confirmEmail(email: string, code: string) {
    try {
      const student = await this.studentRepository.findOneOrFail({
        email,
        confirmationCode: code,
      });

      student.emailConfirmed = true;
      student.confirmationCode = null;

      await this.em.flush();

      return {
        status: 'success',
      };
    } catch (e: any) {
      throw new HttpException(
        {
          message: 'ERR_INVALID_CONFIRMATION_CODE',
          errors: { email: 'ERR_INVALID_CONFIRMATION_CODE' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * Sends random motivation to all students, who have enabled notifications.
   * Every motivation is unique for each student and is recorded in the database to prevent sending the same motivation twice.
   * If a student has already received all available motivations, it receives a random one from the beginning.
   */
  @Cron(CronExpression.EVERY_DAY_AT_10AM, {
    name: 'send-random-motivation',
    timeZone: 'Europe/Kyiv',
  })
  public async sendRandomMotivation(ids: number[] = []) {
    // Get all students with enabled notifications
    //  and non-empty expoPushToken
    //  and with the given ids (if ids are not empty)
    const students = await this.studentRepository.find(
      {
        enableNotifications: true,
        expoPushToken: { $ne: null },
        id: ids.length > 0 ? { $in: ids } : { $ne: null },
      },
      {
        populate: ['motivations'],
      },
    );

    console.log(students.length, 'students found');

    for (const student of students) {
      const motivation =
        await this.motivationService.getRandomMotivationForStudent(student);

      student.motivations.add(motivation);
      await this.em.fork().flush();

      await this.notificationService.sendPush(
        student.expoPushToken,
        motivation.text,
        NotificationType.MOTIVATION,
      );
    }
  }

  private async sendEmailConfirmation(student: Student, email: string) {
    // Generate random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await this.notificationService.sendEmailConfirmation(
      email,
      code,
      student.locale,
    );

    student.confirmationCode = code;
    await this.em.flush();
  }
}
