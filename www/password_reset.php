<?php
	require_once('../engine/bootstrap.php');

	$reset_page = new PasswordResetPage();
	echo $reset_page->hasValidKey() ? $reset_page : new RecoveryPage();
?>