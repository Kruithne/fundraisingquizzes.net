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

-- [3] add avatar_id column
ALTER TABLE `users` ADD COLUMN `avatar_id` BIGINT UNSIGNED DEFAULT 8;

-- [4] add foreign key constraint for avatar
-- [deps] avatars.sql
ALTER TABLE `users` ADD CONSTRAINT `fk_users_avatar` 
    FOREIGN KEY (`avatar_id`) REFERENCES `avatars`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- [5] add forum_signature column
ALTER TABLE `users` ADD COLUMN `forum_signature` TEXT DEFAULT NULL;