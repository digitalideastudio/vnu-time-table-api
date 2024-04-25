import { Module } from '@nestjs/common';
import WeatherService from './weather.service';
import WeatherController from './weather.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { SharedModule } from '../shared/shared.module';

@Module({
  controllers: [WeatherController],
  exports: [WeatherService],
  imports: [CacheModule.register(), SharedModule],
  providers: [WeatherService],
})
export class WeatherModule {}
