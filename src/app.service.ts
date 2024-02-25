import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { createHash } from 'node:crypto';
import { exec } from 'node:child_process';
import { v4 } from 'uuid';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { parse } from 'node-html-parser';
import UserDto from './user.dto';
import EmptyResponseException from './exceptions/empty-response.exception';
import DatabaseException from './exceptions/database.exception';

const API_URL = 'http://94.130.69.82/cgi-bin/timetable.cgi';

export interface Faculty {
  key: string;
  label: string;
}

enum CONTENT_TYPE {
  JSON = 'json',
  HTML = 'html',
}

const FACULTIES: Faculty[] = [
  {
    key: '1019',
    label: 'Факультет інформаційних технологій і математики',
  },
  {
    key: '1021',
    label: 'Факультет хімії та екології',
  },
  {
    key: '1022',
    label: 'Факультет біології та лісового господарства',
  },
  {
    key: '1023',
    label: 'Географічний факультет',
  },
  {
    key: '1024',
    label: 'Юридичний факультет',
  },
  {
    key: '1025',
    label: 'Факультет історії, політології та національної безпеки',
  },
  {
    key: '1026',
    label: 'Факультет психології',
  },
  {
    key: '1028',
    label: 'Факультет економіки та управління',
  },
  {
    key: '1029',
    label: 'Факультет міжнародних відносин',
  },
  {
    key: '1030',
    label: 'Факультет філології та журналістики',
  },
  {
    key: '1031',
    label: 'Факультет іноземної філології',
  },
  {
    key: '1033',
    label: 'Факультет культури і мистецтв',
  },
  {
    key: '1034',
    label: 'Факультет педагогічної освіти та соціальної роботи',
  },
  {
    key: '1035',
    label: 'Факультет фізичної культури, спорту та здоров`я',
  },
  {
    key: '1040',
    label: 'Медичний факультет',
  },
  {
    key: '1041',
    label: 'Навчально-науковий фізико-технологічний інститут',
  },
  {
    key: '1042',
    label: 'Навчально-науковий інститут неперервної освіти',
  },
];

@Injectable()
export class AppService {
  public users: UserDto[] = [];

  private expo: Expo;

  private tickets: ExpoPushTicket[] = [];

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    this.expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
  }

  /**
   * Fetches HTML from remote server in windows-1251 encoding and returns it as UTF-8 string
   *
   * @param request
   * @param type
   */
  private async getPageContentWithCurl<R = Record<string, unknown>>(
    request: string,
    type: CONTENT_TYPE.JSON,
  ): Promise<R | null>;
  private async getPageContentWithCurl<R = string>(
    request: string,
  ): Promise<R | null>;
  private async getPageContentWithCurl<R = Record<string, unknown> | string>(
    request: string,
    type: CONTENT_TYPE = CONTENT_TYPE.HTML,
  ): Promise<string | R | null> {
    const timeStart = Date.now();
    const cacheKey = createHash('md5').update(request).digest('hex');
    const value = await this.cacheManager.get<string>(cacheKey);

    if (value) {
      console.log(
        `Returning cached in ${Date.now() - timeStart}ms value for ${request}:`,
      );
      console.log(value);
      return value;
    }

    const command = `curl -s -L ${request} | iconv -f windows-1251 -t utf-8`;
    console.log(`Running command: ${command}`);

    // Run the child process and wait for its completion, and then return the result
    const raw = await new Promise<string>((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error running command: ${error.message}`);
          reject(error);
          return;
        }

        if (stderr) {
          console.error(`Error running command: ${stderr}`);
          reject(stderr);
          return;
        }

        resolve(stdout);
      });
    });

    let content = raw.trim();

    try {
      content = type === CONTENT_TYPE.JSON ? JSON.parse(content) : content;
    } catch (e) {
      console.error(e.message);
    }

    await this.cacheManager.set(cacheKey, content, 60 * 60 * 1000); // 1 hour

    console.log(
      `Returning fresh value in ${Date.now() - timeStart}ms for ${request}:`,
    );
    console.log(content);
    return content;
  }

  public getFaculties(): Faculty[] {
    return FACULTIES;
  }

  public async searchGroups(
    facultyId: string,
    studyYear: string,
    search: string,
  ) {
    const params = new URLSearchParams();

    params.append('n', '701');
    params.append('lev', '142');
    params.append('faculty', facultyId);
    params.append('course', studyYear);
    params.append('query', search);

    console.log(
      `Getting groups for faculty ${facultyId}, year ${studyYear}, search ${search}`,
    );
    const command = `"${API_URL}?${params.toString()}"`;
    console.log(`Running command: ${command}`);

    return this.getPageContentWithCurl<{
      query: string;
      suggestions: string[];
    }>(command, CONTENT_TYPE.JSON).then((json) => {
      return json?.suggestions || [];
    });
  }

  registerUser(user: UserDto) {
    // Add the user to the list of users, if it's not already there
    // unique by expoPushToken
    // Update the user's data if it's already there
    const index = this.users.findIndex(
      (u) => u.expoPushToken === user.expoPushToken,
    );

    if (index !== -1) {
      this.users[index] = user;
    } else {
      this.users.push({
        ...user,
        uuid: v4(),
      });
    }

    console.log('Registered user:', user);

    return { status: 'ok' };
  }

  public async sendPushNotification(message: string, uuid: string) {
    const user = this.users.find((u) => u.uuid === uuid);

    if (!user) {
      console.error(`User with uuid ${uuid} not found`);
      return { status: 'error', message: 'User not found' };
    }

    await this.sendPushNotificationToExpo(message, user.expoPushToken);

    console.log(`Sending push notification to user ${uuid}:`, message);
  }

  private async sendPushNotificationToExpo(
    message: string,
    expoPushToken: string,
  ) {
    if (!Expo.isExpoPushToken(expoPushToken)) {
      console.error(
        `Push token ${expoPushToken} is not a valid Expo push token`,
      );

      throw new Error('Invalid push token');
    }

    const messages: ExpoPushMessage[] = [
      {
        to: expoPushToken,
        sound: 'default',
        body: message,
      },
    ];

    console.log('Sending push notification to expo:', messages);

    const chunks = this.expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);

      console.log('Ticket chunk:', ticketChunk);
      this.tickets.push(...ticketChunk);
    }
  }

  public async getTimetable(startDate: string, endDate: string, group: string) {
    console.log(
      `Getting timetable for group ${group} from ${startDate} to ${endDate}`,
    );

    const params = new URLSearchParams();
    // Format dates as DD.MM.YYYY
    // const sdate = new Date(startDate).toLocaleDateString('uk-UA');
    const sdate = '25.02.2024';
    // const edate = new Date(endDate).toLocaleDateString('uk-UA');
    const edate = '30.04.2024';

    params.append('faculty', '0');
    params.append('teacher', '');
    params.append('course', '0');
    params.append('sdate', sdate);
    params.append('edate', edate);
    params.append('n', '700');

    console.log(
      `Getting groups for faculty ${group}, start date ${sdate}, end date ${edate}`,
    );
    const command = `"${API_URL}?n=700" --data-raw '${params.toString()}&group=${group}'`;
    console.log(`Running command: ${command}`);

    return this.getPageContentWithCurl(command).then((html) => {
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
