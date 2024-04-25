import WeatherService from './weather.service';
import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('weather')
@Controller('weather')
export default class WeatherController {
  constructor(private readonly studentService: WeatherService) {}

  @ApiOperation({ summary: 'Get forecast by location and language' })
  @ApiResponse({
    status: 200,
    description: 'Forecast has been successfully found',
  })
  @ApiResponse({ status: 404, description: 'Forecast not found' })
  @Get('/forecast')
  async getForecast(
    @Query('lat') lat: number,
    @Query('long') long: number,
    @Query('lang') lang: string,
  ) {
    return this.studentService.getForecast(lat, long, lang);
  }

  @ApiOperation({ summary: 'Get forecast suggestion by location and language' })
  @ApiResponse({
    status: 200,
    description: 'Forecast suggestion has been successfully found',
  })
  @ApiResponse({ status: 404, description: 'Forecast suggestion not found' })
  @Get('/image')
  async getForecastSuggestion(
    @Query('lat') lat: number,
    @Query('long') long: number,
    @Query('lang') lang: string,
    @Query('studentId') studentId: number,
  ) {
    return this.studentService.getForecastSuggestion(
      lat,
      long,
      lang,
      studentId,
    );
  }
}
