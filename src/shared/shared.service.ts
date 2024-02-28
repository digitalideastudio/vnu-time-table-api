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

    console.log(content);
    return content;
  }
}
