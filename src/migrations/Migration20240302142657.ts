import { Migration } from '@mikro-orm/migrations';

export class Migration20240302142657 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table `motivation` (`id` integer not null primary key autoincrement, `text` text not null, `created_at` datetime not null, `updated_at` datetime not null);',
    );

    this.addSql(
      'create table `motivation_recipients` (`motivation_id` integer not null, `student_id` integer not null, constraint `motivation_recipients_motivation_id_foreign` foreign key(`motivation_id`) references `motivation`(`id`) on delete cascade on update cascade, constraint `motivation_recipients_student_id_foreign` foreign key(`student_id`) references `student`(`id`) on delete cascade on update cascade, primary key (`motivation_id`, `student_id`));',
    );
    this.addSql(
      'create index `motivation_recipients_motivation_id_index` on `motivation_recipients` (`motivation_id`);',
    );
    this.addSql(
      'create index `motivation_recipients_student_id_index` on `motivation_recipients` (`student_id`);',
    );
  }
}
