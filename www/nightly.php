<?php
	require_once('../lib/bootstrap.php'); // Include framework

	if (REST::Get('key') !== NIGHTLY_CRON_KEY)
		die();

	// Decrement updated_flag on all quizzes by 1
	$query = DB::prepare('UPDATE quizzes SET updated_flag = updated_flag - 1 WHERE updated_flag > 0');
	$query->execute();

	echo $query->rowCount() . ' update flags decreased ' . PHP_HTML_EOL;

	// Decrement new_flag on all quizzes by 1
	$query = DB::prepare('UPDATE quizzes SET new_flag = new_flag -1 WHERE new_flag > 0');
	$query->execute();

	echo $query->rowCount() . ' new flags decreased.' . PHP_HTML_EOL;

	// Remove quizzes that have past their closing date
	$query = DB::prepare('DELETE FROM quizzes WHERE closing < NOW()');
	$query->execute();

	echo $query->rowCount() . ' quizzes deleted, closing dates past.';
?>