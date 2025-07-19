<?php
	require_once('../engine/bootstrap.php');
	echo Authenticator::isLoggedIn() ? new LandingPage() : new RecoveryPage();
?>