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
import NotificationService from '../notifications/notification.service';

@Injectable()
export default class StudentService {
  constructor(
    private readonly studentRepository: StudentRepository,
    private readonly facultyService: FacultyService,
    private readonly groupService: GroupService,
    private readonly notificationService: NotificationService,
    private readonly em: EntityManager,
  ) {}

  public async findAll(): Promise<Student[]> {
    return this.studentRepository.findAll();
  }

  public async register(dto: CreateStudentDto): Promise<IStudentRO> {
    const { expoPushToken, email, facultyId, year, groupId } = dto;

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
    const student = new Student(email, expoPushToken, faculty, group, year);
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

    wrap(student).assign({
      expoPushToken: dto.expoPushToken,
      email: dto.email,
      faculty,
      group,
      year: dto.year,
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
    };

    return { student: studentRO };
  }

  public async sendPushNotification(userId: number, message: string) {
    const user = await this.studentRepository.findOne(userId);

    if (!user) {
      throw new HttpException(
        {
          message: 'ERR_BAD_INPUT',
          errors: { userId: 'ERR_BAD_INPUT' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.notificationService.sendPush(user.expoPushToken, message);
  }
}
