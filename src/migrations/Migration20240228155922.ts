import { Migration } from '@mikro-orm/migrations';

export class Migration20240228155922 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table `student` add column `enable_notifications` integer null default true;');
  }

}
