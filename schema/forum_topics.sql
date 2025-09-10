-- [1] create forum topics table
CREATE TABLE `forum_topics` (
	`id` SERIAL PRIMARY KEY,
	`title` VARCHAR(200) NOT NULL,
	`creator_id` BIGINT UNSIGNED NOT NULL,
	`created` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`sticky` TINYINT NOT NULL DEFAULT 0,
	`views` INT UNSIGNED NOT NULL DEFAULT 0,
	`topic_type` TINYINT NOT NULL DEFAULT 1,
	INDEX `idx_creator` (`creator_id`),
	INDEX `idx_sticky_updated` (`sticky`, `updated`),
	INDEX `idx_topic_type` (`topic_type`),
	FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
);