<?php
	require_once('../engine/bootstrap.php');
	if (Authenticator::isLoggedIn())
		Authenticator::getLoggedInUser()->addFlag(User::FLAG_BIRTHDAY_PROMPT);

	header("Location: http://www.fundraisingquizzes.net/");
?>