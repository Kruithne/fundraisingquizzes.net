<?php
	require_once('../lib/KrameWork/KrameWork/KrameSystem.php');

	$system = new KrameSystem();

	$system->getErrorHandler()->addEmailOutputRecipient('kruithne+fquizzes@gmail.com');
	$system->addAutoLoadPath('../modules');
	$system->addAutoLoadPath('../engine');
?>