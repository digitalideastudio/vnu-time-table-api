import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import SharedService from '../shared/shared.service';
import GroupService from '../groups/group.service';
import { API_URL } from '../constants';
import EmptyResponseException from '../exceptions/empty-response.exception';
import DatabaseException from '../exceptions/database.exception';
import { parse } from 'node-html-parser';
import GetTimetableDto from './dto/get-timetable.dto';

@Injectable()
export default class TimetableService {
  constructor(
    private readonly sharedService: SharedService,
    private readonly groupService: GroupService,
  ) {}

  public async get(dto: GetTimetableDto) {
    const { startDate, endDate, groupId } = dto;

    if (!startDate || !endDate || !groupId) {
      const errors = {};

      if (!startDate) {
        errors['startDate'] = 'ERR_BAD_INPUT';
      }

      if (!endDate) {
        errors['endDate'] = 'ERR_BAD_INPUT';
      }

      if (!groupId) {
        errors['groupId'] = 'ERR_BAD_INPUT';
      }

      throw new HttpException(
        {
          message: 'ERR_BAD_INPUT',
          errors,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const group = await this.groupService.findOne(groupId);

    if (!group) {
      throw new HttpException(
        {
          message: 'ERR_BAD_INPUT',
          errors: { groupId: 'ERR_BAD_INPUT' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    console.log(
      `Getting timetable for group ${group.name} from ${startDate} to ${endDate}`,
    );

    const params = new URLSearchParams();
    // Format dates as DD.MM.YYYY
    const sdate = new Date(startDate).toLocaleDateString('uk-UA');
    // const sdate = '25.02.2024';
    const edate = new Date(endDate).toLocaleDateString('uk-UA');
    // const edate = '30.04.2024';

    if (sdate === 'Invalid Date' || edate === 'Invalid Date') {
      const errors = {};

      if (sdate === 'Invalid Date') {
        errors['startDate'] = 'ERR_BAD_INPUT';
      }

      if (edate === 'Invalid Date') {
        errors['endDate'] = 'ERR_BAD_INPUT';
      }

      throw new HttpException(
        {
          message: 'ERR_BAD_INPUT',
          errors,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    params.append('faculty', '0');
    params.append('teacher', '');
    params.append('course', '0');
    params.append('sdate', sdate);
    params.append('edate', edate);
    params.append('n', '700');

    console.log(
      `Getting groups for faculty ${group.name}, start date ${sdate}, end date ${edate}`,
    );
    const command = `"${API_URL}?n=700" --data-raw '${params.toString()}&group=${group.refKey}'`;
    console.log(`Running command: ${command}`);

    return this.sharedService.getPageContentWithCurl(command).then((html) => {
      if (!html) {
        throw new EmptyResponseException();
      }

      if (html.includes('EIBInterBaseError')) {
        throw new DatabaseException();
      }

      const root = parse(html);

      return Array.from<HTMLTableRowElement>(
        root.querySelectorAll(
          'table tr',
        ) as unknown as NodeListOf<HTMLTableRowElement>,
      ).map((tr) => ({
        num: tr.children[0].textContent,
        time: tr.children[1].textContent,
        subject: tr.children[2].textContent,
      }));
    });
  }
}
