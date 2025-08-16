-- [1] create table
CREATE TABLE `users` (
	`id` SERIAL PRIMARY KEY,
	`username` VARCHAR(20) NOT NULL,
	`email` VARCHAR(254) NOT NULL,
	`flags` INT UNSIGNED NOT NULL DEFAULT 0,
	`created` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	UNIQUE KEY `idx_username` (`username`),
	UNIQUE KEY `idx_email` (`email`)
);

-- [2] add `password` column
ALTER TABLE `users` ADD COLUMN `password` VARCHAR(255) NOT NULL;