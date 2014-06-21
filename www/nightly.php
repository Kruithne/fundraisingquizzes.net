<?php
	require_once('../engine/bootstrap.php');

	// Check the correct key was given, otherwise end script.
	if (REST::Get('key') !== NIGHTLY_KEY)
		die();

	DB::get()->execute('UPDATE quizzes SET deleted = 1 WHERE closing < CURDATE()');

	// Delete any expired password keys.
	DB::get()->execute('DELETE FROM password_resets WHERE created < DATE_SUB(NOW(), INTERVAL 1 DAY)');
?>