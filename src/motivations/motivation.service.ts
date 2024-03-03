import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import MotivationRepository from './motivation.repository';
import Motivation from './motivation.entity';
import { EntityManager, wrap } from '@mikro-orm/core';
import CreateMotivationDto from './dto/create-motivation.dto';
import UpdateMotivationDto from './dto/update-motivation.dto';
import Student from '../students/student.entity';

@Injectable()
export default class MotivationService {
  constructor(
    private readonly motivationRepository: MotivationRepository,
    private readonly em: EntityManager,
  ) {}

  public async findAll(): Promise<Motivation[]> {
    return this.motivationRepository.findAll();
  }

  public async create(dto: CreateMotivationDto) {
    const motivation = new Motivation(dto.text);

    await this.em.persistAndFlush(motivation);

    return this.buildMotivationResponse(motivation);
  }

  public async createMany(motivationData: string[]) {
    const motivations = motivationData.map((text) => new Motivation(text));

    await this.em.persistAndFlush(motivations);

    return {
      motivations: motivations.map((motivation) =>
        this.buildMotivationResponse(motivation),
      ),
    };
  }

  public async update(dto: UpdateMotivationDto) {
    const motivation = await this.motivationRepository.findOne(dto.id);

    if (!motivation) {
      throw new HttpException(
        {
          message: 'ERR_BAD_INPUT',
          errors: { id: 'ERR_BAD_INPUT' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    wrap(motivation).assign(dto);

    await this.em.flush();

    return this.buildMotivationResponse(motivation);
  }

  public async delete(motivationId: number) {
    const deletedCount =
      await this.motivationRepository.nativeDelete(motivationId);

    return {
      status: deletedCount > 0 ? 'success' : 'fail',
    };
  }

  private buildMotivationResponse(motivation: Motivation) {
    const motivationResponse = {
      id: motivation.id,
      text: motivation.text,
      createdAt: motivation.createdAt,
      updatedAt: motivation.updatedAt,
    };

    return {
      motivation: motivationResponse,
    };
  }

  async getRandomMotivationForStudent(student: Student): Promise<Motivation> {
    const motivations = await this.motivationRepository.findAll();
    const studentMotivationIds = student.motivations.getIdentifiers();

    // Create a map of all motivations, where the key is the motivation id,
    // and the value is a number of times the motivation was sent to the student.
    const motivationCountMap = new Map<number, number>();

    for (const motivation of motivations) {
      const studentMotivationCount = motivationCountMap.get(motivation.id);
      const count = studentMotivationIds.filter(
        (id) => id === motivation.id,
      ).length;

      if (studentMotivationCount) {
        motivationCountMap.set(motivation.id, studentMotivationCount + count);
      } else {
        motivationCountMap.set(motivation.id, count);
      }
    }

    // Find a random motivation with the lowest count,
    // or a random motivation if all motivations have the same count.
    // If the student has received all motivations, reset the count.
    let minCount = Infinity;
    let minCountMotivationId = 0;

    for (const [motivationId, count] of motivationCountMap) {
      if (count < minCount) {
        minCount = count;
        minCountMotivationId = motivationId;
      }
    }

    if (minCount === 0) {
      return motivations[Math.floor(Math.random() * motivations.length)];
    }

    if (minCount === Infinity) {
      throw new Error('No motivations found');
    }

    return motivations.find(
      (motivation) => motivation.id === minCountMotivationId,
    );
  }
}
