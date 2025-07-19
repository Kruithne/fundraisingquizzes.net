<?php
	require_once('../engine/bootstrap.php');
	echo Authenticator::isLoggedIn() ? new ForumPage() : new RegisterPage();
?>