import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// https://nestjs-i18n.com/guides/type-safety
export default class CreateStudentDto {
  @IsString()
  readonly expoPushToken: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  readonly facultyId: number;

  @IsNotEmpty()
  readonly year: number;

  @IsNotEmpty()
  readonly groupId: number;

  @IsNotEmpty()
  locale: string;

  @IsNotEmpty()
  deviceLocale: string;

  enableNotifications: boolean;
}
