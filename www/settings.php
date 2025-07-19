<?php
	require_once('../engine/bootstrap.php');
	echo Authenticator::isLoggedIn() ? new SettingsPage() : new LandingPage();
?>