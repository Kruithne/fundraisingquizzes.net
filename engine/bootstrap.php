<?php
	require_once('constants.php');
	require_once('../lib/KrameWork/KrameWork/KrameSystem.php');

	$system = new KrameSystem();

	$system->getErrorHandler()->addEmailOutputRecipient('kruithne+fquizzes@gmail.com');
	$system->addAutoLoadPath('../modules');
	$system->addAutoLoadPath('../engine');
	$system->addAutoLoadPath('../engine/objects');
	$system->addAutoLoadPath('../engine/handlers');
	$system->addAutoLoadPath('../engine/interfaces');
	$system->addAutoLoadPath('../engine/listeners');
?>