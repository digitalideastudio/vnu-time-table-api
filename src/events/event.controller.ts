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

  @ApiOperation({ summary: 'Get university events' })
  @ApiResponse({
    status: 200,
    description: 'List of university events',
    type: Event,
    isArray: true,
  })
  @Get()
  async findAll() {
    return this.eventService.findAll();
  }

  @ApiOperation({ summary: 'Get external events' })
  @ApiResponse({
    status: 200,
    description: 'List of external events',
    type: Event,
    isArray: true,
  })
  @Get('external')
  async findExternal(): Promise<Event[]> {
    return this.eventService.findExternal();
  }
}
