-- [1] create quiz_votes table
-- [deps] users.sql, quizzes.sql
CREATE TABLE `quiz_votes` (
	`user_id` BIGINT UNSIGNED NOT NULL,
	`quiz_id` BIGINT UNSIGNED NOT NULL,
	PRIMARY KEY (`user_id`, `quiz_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
	FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE
);