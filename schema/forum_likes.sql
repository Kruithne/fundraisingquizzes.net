-- [1] create forum likes table
-- [deps] forum_replies.sql
CREATE TABLE `forum_likes` (
	`id` SERIAL PRIMARY KEY,
	`user_id` BIGINT UNSIGNED NOT NULL,
	`reply_id` BIGINT UNSIGNED NOT NULL,
	`created` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	UNIQUE KEY `unique_user_reply` (`user_id`, `reply_id`),
	INDEX `idx_reply` (`reply_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (`reply_id`) REFERENCES `forum_replies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);