-- [1] create quiz_queries table
CREATE TABLE `quiz_queries` (
	`id` SERIAL PRIMARY KEY,
	`quiz_id` BIGINT UNSIGNED NOT NULL,
	`query_user_id` BIGINT UNSIGNED NOT NULL,
	`answer_user_id` BIGINT UNSIGNED DEFAULT NULL,
	`query_text` VARCHAR(255) NOT NULL,
	`answer_text` VARCHAR(255) DEFAULT NULL,
	FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`id`) ON DELETE CASCADE,
	FOREIGN KEY (`query_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
	FOREIGN KEY (`answer_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
	INDEX `idx_quiz_id` (`quiz_id`)
);