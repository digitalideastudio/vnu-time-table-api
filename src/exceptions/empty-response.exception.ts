import { HttpException } from '@nestjs/common';

export default class EmptyResponseException extends HttpException {
  constructor() {
    super('Empty response', 204);
  }
}
