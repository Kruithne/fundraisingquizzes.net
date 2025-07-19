<?php
	require_once('../engine/bootstrap.php');

	// Check the correct key was given, otherwise end script.
	if (REST::Get('key') !== NIGHTLY_KEY)
		die();

	$db = DB::get();

	$db->execute('UPDATE quizzes SET new_flag = new_flag - 1 WHERE new_flag > 0');
	$db->execute('UPDATE quizzes SET updated_flag = updated_flag - 1 WHERE updated_flag > 0');

	$db->execute('UPDATE quizzes SET deleted = 1 WHERE closing < CURDATE()');

	// Delete any expired password keys.
	$db->execute('DELETE FROM password_resets WHERE created < DATE_SUB(NOW(), INTERVAL 1 DAY)');

	// Delete any expired answer sets
	$db->execute('DELETE FROM quiz_answers WHERE closed < DATE_SUB(NOW(), INTERVAL 1 MONTH)');

	// Birthday stuffs.
	$db->execute('UPDATE users SET avatar = prev_avatar, prev_avatar = NULL WHERE prev_avatar IS NOT NULL');
	$db->execute('UPDATE users SET prev_avatar = avatar, avatar = 37 WHERE MONTH(birthday) = MONTH(NOW()) AND DAY(birthday) = DAY(NOW())');

	foreach ($db->prepare('SELECT username FROM users WHERE prev_avatar IS NOT NULL')->getRows() as $row)
	{
		// Create new birthday thread
		$username = $row->username;
		$thread = ForumTopic::create("Happy Birthday $username!", "The team behind Fundraising Quizzes would like to wish $username a very happy birthday! Hopefully your birthday wish to win more quizzes comes true!", 1, ForumTopic::TYPE_NORMAL);
	}
?>