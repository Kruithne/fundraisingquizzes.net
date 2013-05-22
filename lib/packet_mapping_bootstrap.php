<?php
	// Always load after the framework bootstrap.

	ClassLoader::registerPacketHandler(1, 'login.php', 'LoginPacketHandler');
	ClassLoader::registerPacketHandler(2, 'register.php', 'RegisterPacketHandler');
	ClassLoader::registerPacketHandler(3, 'quiz_list.php', 'QuizListPacketHandler');
	ClassLoader::registerPacketHandler(4, 'bookmarks.php', 'BookmarksPacketHandler');
	ClassLoader::registerPacketHandler(5, 'bookmark_quiz.php', 'BookmarkQuizPacketHandler');
	ClassLoader::registerPacketHandler(6, 'votes.php', 'VotesPacketHandler');
	ClassLoader::registerPacketHandler(7, 'vote_quiz.php', 'VoteQuizPacketHandler');
	ClassLoader::registerPacketHandler(8, 'quiz_data.php', 'QuizDataPacketHandler');
	ClassLoader::registerPacketHandler(9, 'edit_quiz.php', 'EditQuizPacketHandler');
	ClassLoader::registerPacketHandler(10, 'delete_quiz.php', 'DeleteQuizPacketHandler');
?>