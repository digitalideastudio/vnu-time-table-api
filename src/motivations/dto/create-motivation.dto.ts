import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// https://nestjs-i18n.com/guides/type-safety
export default class CreateMotivationDto {
  @ApiProperty({
    example: 'Have a good time',
    description: 'The text of the motivation',
  })
  @IsString()
  @IsNotEmpty()
  text: string;
}
