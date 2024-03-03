import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export default class UpdateMotivationDto {
  @ApiProperty({
    example: 1,
    description: 'The id of the motivation',
  })
  @IsNumber()
  @IsNotEmpty()
  readonly id: number;

  @ApiProperty({
    example: 'Have a good time',
    description: 'The text of the motivation',
  })
  @IsString()
  @IsNotEmpty()
  text: string;
}
