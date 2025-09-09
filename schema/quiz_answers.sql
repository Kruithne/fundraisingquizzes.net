-- [1] create quiz_answers table
CREATE TABLE `quiz_answers` (
	`id` SERIAL PRIMARY KEY,
	`title` VARCHAR(100) NOT NULL,
	`charity` VARCHAR(100) NOT NULL,
	`answers` TEXT NOT NULL,
	`closing` DATE NOT NULL,
	`flags` INT UNSIGNED NOT NULL DEFAULT 0,
	`created_ts` BIGINT UNSIGNED NOT NULL DEFAULT (UNIX_TIMESTAMP() * 1000),
	`updated_ts` BIGINT UNSIGNED NOT NULL DEFAULT (UNIX_TIMESTAMP() * 1000),
	`user_id` BIGINT UNSIGNED NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
	INDEX `idx_closing` (`closing`),
	INDEX `idx_user_id` (`user_id`),
	INDEX `idx_flags` (`flags`)
);