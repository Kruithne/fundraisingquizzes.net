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