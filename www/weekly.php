<?php
	require_once('../lib/bootstrap.php'); // Include framework

	if (REST::Get('key') !== WEEKLY_CRON_KEY)
		die();

	$query = DB::prepare('SELECT QuizID FROM quiz_votes GROUP BY QuizID ORDER BY COUNT(*) DESC LIMIT 1');
	$query->execute();

	if ($quiz = $query->fetchObject())
		Settings::Set('weeklyQuiz', $quiz->QuizID);
?>