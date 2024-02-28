import { Contains, IsEmail, IsNotEmpty, IsString } from 'class-validator';

export default class UpdateStudentDto {
  @IsString()
  @IsNotEmpty()
  readonly id: number;

  @IsNotEmpty()
  @IsString()
  @Contains('ExponentPushToken')
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
}
