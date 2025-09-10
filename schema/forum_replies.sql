-- [1] create forum replies table
-- [deps] forum_topics.sql
CREATE TABLE `forum_replies` (
	`id` SERIAL PRIMARY KEY,
	`topic_id` BIGINT UNSIGNED NOT NULL,
	`text` TEXT NOT NULL,
	`poster_id` BIGINT UNSIGNED NOT NULL,
	`created` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated` DATETIME NULL DEFAULT NULL,
	INDEX `idx_topic` (`topic_id`),
	INDEX `idx_poster` (`poster_id`),
	INDEX `idx_created` (`created`),
	FOREIGN KEY (`topic_id`) REFERENCES `forum_topics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
	FOREIGN KEY (`poster_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);