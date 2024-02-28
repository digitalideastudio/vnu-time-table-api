import Faculty from '../faculties/faculty.entity';
import Group from '../groups/group.entity';

export interface IStudentData {
  expoPushToken: string;
  email: string;
  faculty: Faculty;
  group: Group;
  year: number;
  locale: string;
  deviceLocale: string;
  enableNotifications: boolean;
}

export interface IStudentRO {
  student: IStudentData;
}
