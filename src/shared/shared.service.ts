import { Inject, Injectable } from '@nestjs/common';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { createHash } from 'node:crypto';
import { exec } from 'node:child_process';

export enum CONTENT_TYPE {
  JSON = 'json',
  HTML = 'html',
}

@Injectable()
export default class SharedService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Fetches HTML from remote server in windows-1251 encoding and returns it as UTF-8 string
   *
   * @param request
   * @param type
   */
  public async getPageContentWithCurl<R = Record<string, unknown>>(
    request: string,
    type: CONTENT_TYPE.JSON,
  ): Promise<R | null>;
  public async getPageContentWithCurl<R = string>(
    request: string,
  ): Promise<R | null>;
  public async getPageContentWithCurl<R = Record<string, unknown> | string>(
    request: string,
    type: CONTENT_TYPE = CONTENT_TYPE.HTML,
  ): Promise<string | R | null> {
    const perfT1 = process.hrtime();
    const cacheKey = createHash('md5').update(request).digest('hex');
    const value = await this.cacheManager.get<string>(cacheKey);

    if (value) {
      console.log(
        `Returning cached in ${process.hrtime(perfT1)}ms value for ${request}:`,
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
      `Returning fresh value in ${process.hrtime(perfT1)}ms for ${request}:`,
    );

    // console.log(content);
    return content;
  }

  /**
   * Encodes a string to windows-1251 and then to URI component
   *
   * @param str
   * @example: "Інф-25О" -> "%B2%ED%F4-25%CE"
   */
  public encodeWin1251ToURIComponent(str: string): string {
    const win1251Mapping = {
      А: 'C0',
      Б: 'C1',
      В: 'C2',
      Г: 'C3',
      Д: 'C4',
      Е: 'C5',
      Ж: 'C6',
      З: 'C7',
      И: 'C8',
      Й: 'C9',
      К: 'CA',
      Л: 'CB',
      М: 'CC',
      Н: 'CD',
      О: 'CE',
      П: 'CF',
      Р: 'D0',
      С: 'D1',
      Т: 'D2',
      У: 'D3',
      Ф: 'D4',
      Х: 'D5',
      Ц: 'D6',
      Ч: 'D7',
      Ш: 'D8',
      Щ: 'D9',
      Ъ: 'DA',
      Ы: 'DB',
      Ь: 'DC',
      Э: 'DD',
      Ю: 'DE',
      Я: 'DF',
      а: 'E0',
      б: 'E1',
      в: 'E2',
      г: 'E3',
      д: 'E4',
      е: 'E5',
      ж: 'E6',
      з: 'E7',
      и: 'E8',
      й: 'E9',
      к: 'EA',
      л: 'EB',
      м: 'EC',
      н: 'ED',
      о: 'EE',
      п: 'EF',
      р: 'F0',
      с: 'F1',
      т: 'F2',
      у: 'F3',
      ф: 'F4',
      х: 'F5',
      ц: 'F6',
      ч: 'F7',
      ш: 'F8',
      щ: 'F9',
      ъ: 'FA',
      ы: 'FB',
      ь: 'FC',
      э: 'FD',
      ю: 'FE',
      я: 'FF',
      // Special characters
      Ё: 'A8',
      ё: 'B8',
      Є: 'AA',
      є: 'BA',
      Ї: 'AF',
      ї: 'BF',
      І: 'B2',
      і: 'A5',
      // Add other mappings as needed
    };

    return Array.from(str)
      .map((char) => (win1251Mapping[char] ? '%' + win1251Mapping[char] : char))
      .join('');
  }
}
