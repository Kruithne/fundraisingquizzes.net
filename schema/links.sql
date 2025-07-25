-- [1] create table
CREATE TABLE `links` (
	`id` SERIAL PRIMARY KEY,
	`url` VARCHAR(255) NOT NULL,
	`title` VARCHAR(255) NOT NULL,
	`desc` VARCHAR(255) NOT NULL
);