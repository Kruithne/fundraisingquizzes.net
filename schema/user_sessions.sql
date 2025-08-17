-- [1] create table
CREATE TABLE `user_sessions` (
	`session_id` CHAR(36) NOT NULL PRIMARY KEY,
	`user_id` BIGINT UNSIGNED NOT NULL,
	INDEX `idx_user` (`user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
);