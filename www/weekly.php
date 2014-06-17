<?php
	require_once('../engine/bootstrap.php');

	// Check the correct key was given, otherwise end script.
	if (REST::Get('key') !== WEEKLY_KEY)
		die();

	$quiz = VoteHandler::getHighestQuiz();
	Settings::set('weeklyQuiz', $quiz instanceof Quiz ? $quiz->getId() : $quiz);
	VoteHandler::clearAllVotes();
?>