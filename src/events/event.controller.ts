import { Controller, Get } from '@nestjs/common';
import EventService from './event.service';
import Event from './event.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('events')
@Controller('events')
export default class EventController {
  constructor(private readonly eventService: EventService) {}

  @ApiOperation({ summary: 'Get all motivations' })
  @ApiResponse({
    status: 200,
    description: 'List of all events',
    type: Event,
    isArray: true,
  })
  @Get()
  async findAll(): Promise<Event[]> {
    return this.eventService.findAll();
  }
}
