import { Migration } from '@mikro-orm/migrations';

export class Migration20240228162554 extends Migration {

  async up(): Promise<void> {
    this.addSql('PRAGMA foreign_keys = OFF;');
    this.addSql('CREATE TABLE `_knex_temp_alter067` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, `expo_push_token` text, `email` text NOT NULL, `faculty_id` integer NOT NULL, `year` integer NOT NULL, `group_id` integer NOT NULL, `created_at` datetime NOT NULL, `updated_at` datetime NOT NULL, `locale` text NOT NULL, `device_locale` text NOT NULL, `enable_notifications` integer NULL DEFAULT true, CONSTRAINT `student_faculty_id_foreign` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`) ON UPDATE CASCADE, CONSTRAINT `student_group_id_foreign` FOREIGN KEY (`group_id`) REFERENCES `group` (`id`) ON UPDATE CASCADE);');
    this.addSql('INSERT INTO "_knex_temp_alter067" SELECT * FROM "student";;');
    this.addSql('DROP TABLE "student";');
    this.addSql('ALTER TABLE "_knex_temp_alter067" RENAME TO "student";');
    this.addSql('CREATE INDEX `student_faculty_id_index` on `student` (`faculty_id`);');
    this.addSql('CREATE INDEX `student_group_id_index` on `student` (`group_id`);');
    this.addSql('PRAGMA foreign_keys = ON;');
  }

}
