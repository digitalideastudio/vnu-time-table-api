import { IsDateString, IsNotEmpty } from 'class-validator';

export default class GetTimetableDto {
  @IsNotEmpty()
  @IsDateString()
  readonly startDate: Date;

  @IsNotEmpty()
  @IsDateString()
  readonly endDate: Date;

  @IsNotEmpty()
  readonly groupId: number;
}
