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

    params.append('faculty', '0');
    params.append('teacher', '');
    params.append('course', '0');
    params.append('sdate', sdate);
    params.append('edate', edate);
    params.append('n', '700');

    const encodedGroup = this.sharedService.encodeWin1251ToURIComponent(
      group.refKey,
    );

    console.log(
      `Getting groups for faculty ${encodedGroup}, start date ${sdate}, end date ${edate}`,
    );
    // const command = `"${API_URL}?n=700" --data-raw '${params.toString()}&group=${group.refKey}'`;
    const command = `"${API_URL}?n=700" --data-raw '${params.toString()}&group=${encodedGroup}'`;
    console.log(`Running command: ${command}`);

    return this.sharedService.getPageContentWithCurl(command).then((html) => {
      if (!html) {
        throw new EmptyResponseException();
      }

      if (html.includes('EIBInterBaseError')) {
        throw new DatabaseException();
      }

      const tableHtml = html.match(/<table[^>]*>[\s\S]*?<\/table>/g);
      const fixedTableHtml = tableHtml?.[0]?.replace(
        /<\/tr><\/div><div class="row"><tr>/g,
        '</tr><tr>',
      );

      if (!fixedTableHtml) {
        throw new EmptyResponseException();
      }

      const table = parse(fixedTableHtml, {
        lowerCaseTagName: true,
        parseNoneClosedTags: true,
        voidTag: {
          tags: [
            'div',
            'area',
            'base',
            'br',
            'col',
            'embed',
            'hr',
            'img',
            'input',
            'link',
            'meta',
            'param',
            'source',
            'track',
            'wbr',
            'script',
            'style',
          ],
          closingSlash: true,
        },
      }) as unknown as HTMLTableElement;

      // @ts-ignore
      return table.childNodes[0].childNodes.flatMap((tr) => ({
        number: tr.childNodes[0]?.textContent?.trim(),
        time: tr.childNodes[1]?.textContent?.trim(),
        subject: tr.childNodes[2]?.textContent?.trim(),
      }));
    });
  }
}
