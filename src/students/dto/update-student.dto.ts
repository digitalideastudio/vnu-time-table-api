import {
  Contains,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export default class UpdateStudentDto {
  @IsNumber()
  @IsNotEmpty()
  readonly id: number;

  @IsNotEmpty()
  @IsString()
  @Contains('ExponentPushToken')
  readonly expoPushToken: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNumber()
  @IsNotEmpty()
  readonly facultyId: number;

  @IsNumber()
  @IsNotEmpty()
  readonly year: number;

  @IsNumber()
  @IsNotEmpty()
  readonly groupId: number;

  @IsNotEmpty()
  locale: string;

  @IsNotEmpty()
  deviceLocale: string;
}
