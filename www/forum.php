<?php
	require_once('../lib/bootstrap.php'); // Include framework

	if (Authenticator::IsAdmin())
	{
		require_once('../modules/forum.php'); // Include module file
		echo new ForumPage(); // Output the module
	}
	else
	{
		require_once('../modules/comingsoon.php'); // Include module file
		echo new ComingSoonPage(); // Output the module
	}
?>