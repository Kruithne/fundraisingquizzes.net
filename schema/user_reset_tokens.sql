-- [1] table creation
CREATE TABLE `user_reset_tokens` (
	`reset_token` CHAR(36) NOT NULL PRIMARY KEY,
	`user_id` BIGINT UNSIGNED NOT NULL,
	`reset_sent` BIGINT UNSIGNED NOT NULL,
	UNIQUE KEY `uk_user_id` (`user_id`)
);