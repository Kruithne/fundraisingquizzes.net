-- [1] crearte table
CREATE TABLE `today_in_history` (
	`month` TINYINT UNSIGNED NOT NULL,
	`day` TINYINT UNSIGNED NOT NULL,
	`text` VARCHAR(255) NOT NULL,
	PRIMARY KEY (`month`, `day`)
);