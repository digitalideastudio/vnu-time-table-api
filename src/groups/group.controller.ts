import { Controller, Get, Post, Query } from '@nestjs/common';
import GroupService from './group.service';
import Group from './group.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('groups')
@Controller('groups')
export default class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @ApiOperation({ summary: 'Get all groups' })
  @ApiResponse({
    status: 200,
    description: 'List of all groups',
    type: Group,
    isArray: true,
  })
  @Get()
  async findAll(): Promise<Group[]> {
    return this.groupService.findAll();
  }

  @ApiOperation({ summary: 'Search for groups' })
  @ApiResponse({
    status: 200,
    description: 'List of groups',
    type: Group,
    isArray: true,
  })
  @Get('search')
  async search(@Query('search') search: string): Promise<Group[]> {
    return this.groupService.search(search);
  }

  @ApiOperation({ summary: 'Sync groups with source' })
  @ApiResponse({
    status: 200,
    description: 'List of groups',
    type: Group,
    isArray: true,
  })
  @Post('sync')
  async syncWithSource(
    @Query('removeOld') removeOld: boolean,
  ): Promise<Group[]> {
    return this.groupService.syncWithSource(removeOld);
  }
}
