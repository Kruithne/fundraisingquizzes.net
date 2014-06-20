<?php
	require_once('../engine/bootstrap.php');

	// Check the correct key was given, otherwise end script.
	if (REST::Get('key') !== WEEKLY_KEY)
		die();

	$quiz = VoteHandler::getHighestQuiz();
	Settings::set('weeklyQuiz', $quiz instanceof Quiz ? $quiz->getId() : $quiz);
	VoteHandler::clearAllVotes();

	$query = DB::get()->prepare('SELECT ID FROM quizzes WHERE closing < DATE_SUB(NOW(), INTERVAL 1 MONTH)');

	foreach ($query->getRows() as $row)
	{
		$id = $row->ID;

		// Delete queries
		QueryHandler::purge($id);

		// Delete bookmarks
		BookmarkHandler::purge($id);

		// Delete the quiz.
		DB::get()->prepare('DELETE FROM quizzes WHERE ID = :id')->setValue(':id', $id)->execute();
	}
?>