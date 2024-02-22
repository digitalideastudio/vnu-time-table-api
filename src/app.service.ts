import { Inject, Injectable } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer-core';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { createHash } from 'node:crypto';

const API_URL = 'http://94.130.69.82/cgi-bin/timetable.cgi';

export interface Faculty {
  key: string;
  label: string;
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
  private browser: Browser;

  private page: Page;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getPageContent(url: string) {
    const cacheKey = createHash('md5').update(url).digest('hex');
    const value = await this.cacheManager.get(cacheKey);

    if (value) {
      console.log(value);
      return value;
    }

    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'shell',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        channel: 'chrome',
      });
    }

    if (!this.page) {
      this.page = await this.browser.newPage();
    }

    await this.page.goto(url, {
      timeout: 10000,
      waitUntil: 'load',
    });

    const content = await this.page
      .waitForSelector('body')
      .then((body) => body.evaluate((el) => el.innerHTML))
      .then((html) => JSON.parse(html))
      .catch((e) => {
        console.error(e.message);
        return {};
      });

    await this.cacheManager.set(cacheKey, content, 60 * 60 * 1000); // 1 hour

    return content;
  }

  getFaculties(): Faculty[] {
    return FACULTIES;
  }

  async searchGroups(facultyId: string, studyYear: string, search: string) {
    const params = new URLSearchParams();

    params.append('n', '701');
    params.append('lev', '142');
    params.append('faculty', facultyId);
    params.append('course', studyYear);
    params.append('query', search);

    return this.getPageContent(`${API_URL}?${params.toString()}`).then(
      (data) => data.suggestions,
    );
  }
}
