<?php
	require_once('../engine/bootstrap.php');
	echo Authenticator::isLoggedInAsAdmin() ? new AdminPage() : new PrivatePage();
?>