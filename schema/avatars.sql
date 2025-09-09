-- [1] create avatars table
CREATE TABLE `avatars` (
	`id` SERIAL PRIMARY KEY,
	`filename` VARCHAR(100) NOT NULL,
	`name` VARCHAR(50) NOT NULL,
	`created` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	UNIQUE KEY `idx_filename` (`filename`)
);

-- [2] populate avatars with existing images
INSERT INTO `avatars` (`id`, `filename`, `name`) VALUES
(1, 'avatar_cat.png', 'Cat'),
(2, 'avatar_angel.png', 'Angel'),
(3, 'avatar_black_leopard.png', 'Black Leopard'),
(4, 'avatar_candycane.png', 'Candy Cane'),
(5, 'avatar_dachshund.png', 'Dachshund'),
(6, 'avatar_dec_1.png', 'December 1'),
(7, 'avatar_dec_2.png', 'December 2'),
(8, 'avatar_devid.png', 'Devid'),
(9, 'avatar_frog.png', 'Frog'),
(10, 'avatar_hedgehog.png', 'Hedgehog'),
(11, 'avatar_koala.png', 'Koala'),
(12, 'avatar_leopard.png', 'Leopard'),
(13, 'avatar_lion.png', 'Lion'),
(14, 'avatar_moon.png', 'Moon'),
(15, 'avatar_moose.png', 'Moose'),
(16, 'avatar_owl.png', 'Owl'),
(17, 'avatar_panda.png', 'Panda'),
(18, 'avatar_pug.png', 'Pug'),
(19, 'avatar_pumpkin.png', 'Pumpkin'),
(20, 'avatar_reindeer.png', 'Reindeer'),
(21, 'avatar_santa_1.png', 'Santa 1'),
(22, 'avatar_santa_2.png', 'Santa 2'),
(23, 'avatar_santa_3.png', 'Santa 3'),
(24, 'avatar_santa_4.png', 'Santa 4'),
(25, 'avatar_santa_5.png', 'Santa 5'),
(26, 'avatar_santa_6.png', 'Santa 6'),
(27, 'avatar_skull.png', 'Skull'),
(28, 'avatar_snow_leopard.png', 'Snow Leopard'),
(29, 'avatar_snowman.png', 'Snowman'),
(30, 'avatar_snowman_2.png', 'Snowman 2'),
(31, 'avatar_spooky_cat.png', 'Spooky Cat'),
(32, 'avatar_tree.png', 'Tree'),
(33, 'avatar_tree_man.png', 'Tree Man'),
(34, 'avatar_witch_hat.png', 'Witch Hat'),
(35, 'avatar_xmas_hat.png', 'Christmas Hat'),
(36, 'cake.png', 'Cake');

-- [3] add hidden flag column
ALTER TABLE `avatars` ADD COLUMN `hidden` TINYINT NOT NULL DEFAULT 0;

-- [4] add hidden boston avatar
INSERT INTO `avatars` (`filename`, `name`, `hidden`) VALUES
('avatar_boston.png', 'Boston', 1);