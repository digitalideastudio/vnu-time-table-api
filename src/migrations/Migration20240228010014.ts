import { Migration } from '@mikro-orm/migrations';

export class Migration20240228010014 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table `faculty` (`id` integer not null primary key autoincrement, `ref_key` text not null, `name` text not null, `created_at` datetime not null, `updated_at` datetime not null);',
    );

    this.addSql(
      'create table `group` (`id` integer not null primary key autoincrement, `ref_key` text not null, `name` text not null, `created_at` datetime not null, `updated_at` datetime not null);',
    );

    this.addSql(
      'create table `student` (`id` integer not null primary key autoincrement, `expo_push_token` text not null, `email` text not null, `faculty_id` integer not null, `year` integer not null, `group_id` integer not null, `created_at` datetime not null, `updated_at` datetime not null, constraint `student_faculty_id_foreign` foreign key(`faculty_id`) references `faculty`(`id`) on update cascade, constraint `student_group_id_foreign` foreign key(`group_id`) references `group`(`id`) on update cascade);',
    );
    this.addSql(
      'create index `student_faculty_id_index` on `student` (`faculty_id`);',
    );
    this.addSql(
      'create index `student_group_id_index` on `student` (`group_id`);',
    );

    this.addSql(
      'create table `ticket` (`id` integer not null primary key autoincrement, `status` text not null, `ticket_id` text not null, `error_type` text not null, `error_message` text not null, `message` text not null, `expo_push_token` text not null);',
    );
  }
}
