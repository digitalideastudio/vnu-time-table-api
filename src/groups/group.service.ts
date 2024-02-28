import { Injectable } from '@nestjs/common';
import GroupRepository from './group.repository';
import Group from './group.entity';
import { API_URL } from '../constants';
import SharedService, { CONTENT_TYPE } from '../shared/shared.service';
import { EntityManager } from '@mikro-orm/core';

@Injectable()
export default class GroupService {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly sharedService: SharedService,
    private readonly em: EntityManager,
  ) {}

  public async findAll(): Promise<Group[]> {
    return this.groupRepository.findAll();
  }

  public async findOne(id: number): Promise<Group | null> {
    return this.groupRepository.findOne(id);
  }

  public async search(search: string): Promise<Group[]> {
    return this.groupRepository.find({ name: { $like: `%${search}%` } });
  }

  public async syncWithSource(removeOld: boolean = false): Promise<Group[]> {
    const perfT1 = process.hrtime();

    const params = new URLSearchParams();

    params.append('n', '701');
    params.append('lev', '142');
    params.append('faculty', '');
    params.append('course', '');
    params.append('query', '');

    console.log('Syncing groups with source');

    const command = `"${API_URL}?${params.toString()}"`;
    console.log(`Running command: ${command}`);

    const json = await this.sharedService.getPageContentWithCurl<{
      query: string;
      suggestions: string[];
    }>(command, CONTENT_TYPE.JSON);

    const retrievedGroupRefs = json?.suggestions || [];

    if (retrievedGroupRefs.length === 0) {
      console.log('No groups found');

      console.log('Syncing groups with source took', process.hrtime(perfT1));
      return [];
    }

    // Sync retrieved groups with database (create new, update existing, delete missing)
    const existingGroups = await this.groupRepository.findAll();
    const existingGroupRefs = existingGroups.map((g) => g.refKey);
    const newGroupRefs = retrievedGroupRefs.filter(
      (ref) => !existingGroupRefs.includes(ref),
    );
    const oldGroupRefs = existingGroupRefs.filter(
      (ref) => !retrievedGroupRefs.includes(ref),
    );

    console.log('New group refs:', newGroupRefs);
    console.log('Old group refs:', oldGroupRefs);

    // Create new groups
    for (const ref of newGroupRefs) {
      const group = new Group(ref, ref);
      await this.em.persistAndFlush(group);
    }

    if (!removeOld) {
      console.log('Syncing groups with source took', process.hrtime(perfT1));

      return this.groupRepository.findAll();
    }

    // Delete old groups
    for (const ref of oldGroupRefs) {
      const group = existingGroups.find((g) => g.refKey === ref);

      if (group) {
        await this.em.removeAndFlush(group);
      }
    }

    console.log('Syncing groups with source took', process.hrtime(perfT1));
    return this.groupRepository.findAll();
  }
}
