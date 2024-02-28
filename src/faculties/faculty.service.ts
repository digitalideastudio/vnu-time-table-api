import { Injectable } from '@nestjs/common';
import FacultyRepository from './faculty.repository';
import Faculty from './faculty.entity';

@Injectable()
export default class FacultyService {
  constructor(private readonly facultyRepository: FacultyRepository) {}

  public async findAll(): Promise<Faculty[]> {
    return this.facultyRepository.findAll();
  }

  public async findOne(id: number): Promise<Faculty | null> {
    return this.facultyRepository.findOne(id);
  }
}
