<?php
	require_once('../engine/bootstrap.php');

	// Check the correct key was given, otherwise end script.
	if (REST::Get('key') !== NIGHTLY_KEY)
		die();

	$db = DB::get();

	$db->execute('UPDATE quizzes SET new_flag = new_flag - 1');
	$db->execute('UPDATE quizzes SET updated_flag = updated_flag - 1');

	$db->execute('UPDATE quizzes SET deleted = 1 WHERE closing < CURDATE()');

	// Delete any expired password keys.
	$db->execute('DELETE FROM password_resets WHERE created < DATE_SUB(NOW(), INTERVAL 1 DAY)');

	// Delete any expired answer sets
	$db->execute('DELETE FROM quiz_answers WHERE closed < DATE_SUB(NOW(), INTERVAL 1 MONTH)');
?>