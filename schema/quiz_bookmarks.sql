-- [1] create quiz_bookmarks table
CREATE TABLE `quiz_bookmarks` (
	`id` SERIAL PRIMARY KEY,
	`user_id` BIGINT UNSIGNED NOT NULL,
	`quiz_id` BIGINT UNSIGNED NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
	FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE
);

-- [2] add indexes for common lookup patterns
CREATE INDEX `idx_quiz_bookmarks_user_id` ON `quiz_bookmarks` (`user_id`);
CREATE UNIQUE INDEX `idx_quiz_bookmarks_user_quiz` ON `quiz_bookmarks` (`user_id`, `quiz_id`);