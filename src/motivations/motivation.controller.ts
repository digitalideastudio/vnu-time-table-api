import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import MotivationService from './motivation.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import Motivation from './motivation.entity';
import CreateMotivationDto from './dto/create-motivation.dto';
import UpdateMotivationDto from './dto/update-motivation.dto';

@ApiBearerAuth()
@ApiTags('motivations')
@Controller('motivations')
export default class MotivationController {
  constructor(private readonly motivationService: MotivationService) {}

  @ApiOperation({ summary: 'Get all motivations' })
  @ApiResponse({
    status: 200,
    description: 'List of all motivations',
    type: Motivation,
    isArray: true,
  })
  @Get()
  async findAll(): Promise<Motivation[]> {
    return this.motivationService.findAll();
  }

  @ApiOperation({ summary: 'Create a new motivation' })
  @ApiResponse({
    status: 201,
    description: 'Motivation has been successfully created',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post()
  async create(@Body() motivationData: CreateMotivationDto) {
    return this.motivationService.create(motivationData);
  }

  @ApiOperation({ summary: 'Create new motivations' })
  @ApiResponse({
    status: 201,
    description: 'Motivations have been successfully created',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('many')
  async createMany(@Body() motivationData: string[]) {
    return this.motivationService.createMany(motivationData);
  }

  @ApiOperation({ summary: 'Update motivation data' })
  @ApiResponse({
    status: 200,
    description: 'Motivation has been successfully updated',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Put()
  async update(@Body() motivationData: UpdateMotivationDto) {
    return this.motivationService.update(motivationData);
  }

  @ApiOperation({ summary: 'Delete a motivation' })
  @ApiResponse({
    status: 200,
    description: 'Motivation has been successfully deleted',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Delete()
  async delete(@Query('motivationId') motivationId: number) {
    return this.motivationService.delete(motivationId);
  }
}
