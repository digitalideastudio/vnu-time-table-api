import { EntityManager } from '@mikro-orm/core';
import { Seeder } from '@mikro-orm/seeder';
import Faculty from '../faculties/faculty.entity';

const FACULTIES = [
  {
    refKey: '1019',
    name: 'Факультет інформаційних технологій і математики',
  },
  {
    refKey: '1021',
    name: 'Факультет хімії та екології',
  },
  {
    refKey: '1022',
    name: 'Факультет біології та лісового господарства',
  },
  {
    refKey: '1023',
    name: 'Географічний факультет',
  },
  {
    refKey: '1024',
    name: 'Юридичний факультет',
  },
  {
    refKey: '1025',
    name: 'Факультет історії, політології та національної безпеки',
  },
  {
    refKey: '1026',
    name: 'Факультет психології',
  },
  {
    refKey: '1028',
    name: 'Факультет економіки та управління',
  },
  {
    refKey: '1029',
    name: 'Факультет міжнародних відносин',
  },
  {
    refKey: '1030',
    name: 'Факультет філології та журналістики',
  },
  {
    refKey: '1031',
    name: 'Факультет іноземної філології',
  },
  {
    refKey: '1033',
    name: 'Факультет культури і мистецтв',
  },
  {
    refKey: '1034',
    name: 'Факультет педагогічної освіти та соціальної роботи',
  },
  {
    refKey: '1035',
    name: 'Факультет фізичної культури, спорту та здоров`я',
  },
  {
    refKey: '1040',
    name: 'Медичний факультет',
  },
  {
    refKey: '1041',
    name: 'Навчально-науковий фізико-технологічний інститут',
  },
  {
    refKey: '1042',
    name: 'Навчально-науковий інститут неперервної освіти',
  },
];

export class FacultySeeder {
  async run(em: EntityManager): Promise<void> {
    for (const faculty of FACULTIES) {
      const entity = em.create(Faculty, faculty);
      em.persist(entity);
    }
  }
}
