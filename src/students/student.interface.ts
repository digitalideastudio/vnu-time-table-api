import Faculty from '../faculties/faculty.entity';
import Group from '../groups/group.entity';
import Motivation from '../motivations/motivation.entity';

export interface IStudentData {
  expoPushToken: string;
  email: string;
  faculty: Faculty;
  group: Group;
  year: number;
  locale: string;
  deviceLocale: string;
  enableNotifications: boolean;
  motivations?: Motivation[];
}

export interface IStudentRO {
  student: IStudentData;
}
