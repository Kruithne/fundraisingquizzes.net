<?php
	require_once('../engine/bootstrap.php');
	echo Authenticator::isLoggedIn() ? new ThreadPage() : new RegisterPage();
?>