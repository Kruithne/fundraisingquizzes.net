<?php
	require_once('constants.php');
	require_once('../lib/KrameWork/KrameWork/KrameSystem.php');

	date_default_timezone_set('Europe/London');

	KW_ClassLoader::addClassPath('../modules');
	KW_ClassLoader::addClassPath('../engine');
	KW_ClassLoader::addClassPath('../engine/objects');
	KW_ClassLoader::addClassPath('../engine/handlers');
	KW_ClassLoader::addClassPath('../engine/interfaces');
	KW_ClassLoader::addClassPath('../engine/listeners');

	$system = new KrameSystem();
	$system->getErrorHandler()->addEmailOutputRecipient('kruithne+fquizzes@gmail.com');

	REST::setEncoding('ISO-8859-1');

	Authenticator::checkLoginKey();
?>