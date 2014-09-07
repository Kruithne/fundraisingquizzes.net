<?php
	require_once('../engine/bootstrap.php');

	// Check the correct key was given, otherwise end script.
	if (REST::Get('key') !== MONTHLY_KEY)
		die();

	// Create a new monthly thread.
	ForumTopic::create('Monthly Winners: ' . date('F Y', strtotime("last month")), "It's the time of the month again for the monthly winners thread! Here you can post and discuss about yours and other members quiz or competition winnings! Did you win something or earn a score you're proud of and have been dying to tell everyone about it? Now is your chance!", 1, ForumTopic::TYPE_NORMAL)
?>