<?php
	require_once('../engine/bootstrap.php');

	// Check the correct key was given, otherwise end script.
	if (REST::Get('key') !== MONTHLY_KEY)
		die();

	// Get the old thread and flag it as no longer sticky.
	$old_thread = ForumTopic::get(Settings::get('monthlyWinners'));
	$old_thread->setSticky(false);

	// Create a new monthly thread.
	$thread = ForumTopic::create('Monthly Winners: ' . date('F Y', strtotime("last month")), "It's the time of the month again for the monthly winners thread! Here you can post and discuss about yours and other members quiz or competition winnings! Did you win something or earn a score you're proud of and have been dying to tell everyone about it? Now is your chance!", 1, ForumTopic::TYPE_NORMAL);
	$thread->setSticky(true);

	Settings::set('monthlyWinners', $thread->getId());
?>