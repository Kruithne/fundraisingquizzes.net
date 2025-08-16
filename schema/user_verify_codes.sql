-- [1] create table
CREATE TABLE `user_verify_codes` (
	`token` CHAR(16) NOT NULL PRIMARY KEY,
	`code` CHAR(5) NOT NULL,
	`user_id` BIGINT UNSIGNED NOT NULL,
	`last_sent` BIGINT UNSIGNED NOT NULL,
	INDEX `idx_user` (`user_id`)
);