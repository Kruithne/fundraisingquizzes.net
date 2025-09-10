-- [1] create forum read status table
-- [deps] forum_topics.sql
CREATE TABLE `forum_read_status` (
	`id` SERIAL PRIMARY KEY,
	`user_id` BIGINT UNSIGNED NOT NULL,
	`topic_id` BIGINT UNSIGNED NOT NULL,
	`last_read` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	UNIQUE KEY `unique_user_topic` (`user_id`, `topic_id`),
	INDEX `idx_topic` (`topic_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (`topic_id`) REFERENCES `forum_topics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);