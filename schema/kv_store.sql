-- [1] create kv table
CREATE TABLE `kv_store` (
	`key` VARCHAR(50) NOT NULL PRIMARY KEY,
	`value` BIGINT NOT NULL DEFAULT 0
);