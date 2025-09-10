-- [1] create quizzes table
CREATE TABLE `quizzes` (
	`id` SERIAL PRIMARY KEY,
	`title` VARCHAR(100) NOT NULL,
	`charity` VARCHAR(100) NOT NULL,
	`description` VARCHAR(500) NOT NULL,
	`description_extra` VARCHAR(500) NOT NULL
);

-- [2] merge description and description extra
ALTER TABLE `quizzes` MODIFY COLUMN `description` TEXT(1000) NOT NULL;
UPDATE `quizzes` SET `description` = CONCAT(`description`, ' ', `description_extra`) WHERE `description_extra` != '';
ALTER TABLE `quizzes` DROP COLUMN `description_extra`;

-- [3] add quiz_type column
ALTER TABLE `quizzes` ADD COLUMN `type` TINYINT UNSIGNED NOT NULL DEFAULT 0

-- [4] add closing column
ALTER TABLE `quizzes` ADD column `closing` DATE;

-- [5] add flags column
ALTER TABLE `quizzes` ADD column `flags` INT UNSIGNED NOT NULL DEFAULT 0;

-- [6] add created_ts and updated_ts columns
ALTER TABLE `quizzes` ADD column `created_ts` BIGINT UNSIGNED NOT NULL DEFAULT (UNIX_TIMESTAMP() * 1000);
ALTER TABLE `quizzes` ADD column `updated_ts` BIGINT UNSIGNED NOT NULL DEFAULT (UNIX_TIMESTAMP() * 1000);

-- [7] add user_id column to track quiz creators
-- [deps] users.sql
ALTER TABLE `quizzes` ADD COLUMN `user_id` BIGINT UNSIGNED NULL;
UPDATE `quizzes` SET `user_id` = (SELECT MIN(`id`) FROM `users` LIMIT 1) WHERE `user_id` IS NULL;
ALTER TABLE `quizzes` MODIFY COLUMN `user_id` BIGINT UNSIGNED NOT NULL;
ALTER TABLE `quizzes` ADD FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE;