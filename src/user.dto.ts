import {
  Contains,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export default class UserDto {
  @IsNotEmpty()
  @IsString()
  @IsUUID(4)
  uuid: string;

  @IsNotEmpty()
  @IsString()
  @Contains('ExponentPushToken')
  expoPushToken: string;

  @IsOptional()
  @IsString()
  nickname: string;

  @IsNotEmpty()
  @IsString()
  faculty: string;

  @IsNotEmpty()
  @IsString()
  year: string;

  @IsNotEmpty()
  @IsString()
  group: string;
}
