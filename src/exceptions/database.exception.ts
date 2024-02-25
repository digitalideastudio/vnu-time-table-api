import { HttpException } from '@nestjs/common';

export default class DatabaseException extends HttpException {
  constructor() {
    super('Database error', 500);
  }
}
