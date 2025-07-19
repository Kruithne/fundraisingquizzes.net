<?php
	require_once('../engine/bootstrap.php');
	if (Authenticator::isLoggedIn())
	{
		$user = Authenticator::getLoggedInUser();
		$user->addFlag(User::FLAG_BIRTHDAY_PROMPT);
		$user->persist();
	}

	header("Location: http://www.fundraisingquizzes.net/");
?>