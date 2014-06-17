<?php
	require_once('../engine/bootstrap.php');

	// Check the correct key was given, otherwise end script.
	if (REST::Get('key') !== NIGHTLY_KEY)
		die();

	DB::get()->execute('UPDATE quizzes SET deleted = 1 WHERE closing < CURDATE()');
?>