import { Migration } from '@mikro-orm/migrations';

export class Migration20240229224113 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'alter table `student` add column `email_confirmed` integer null default false;',
    );
    this.addSql(
      'alter table `student` add column `confirmation_code` text null default false;',
    );
  }
}
