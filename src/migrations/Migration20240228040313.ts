import { Migration } from '@mikro-orm/migrations';

export class Migration20240228040313 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table `student` add column `locale` text not null;');
    this.addSql(
      'alter table `student` add column `device_locale` text not null;',
    );
  }
}
