<?php
	require_once('constants.php');
	require_once('../lib/KrameWork/KrameWork/KrameSystem.php');

	KW_ClassLoader::addClassPath('../modules');
	KW_ClassLoader::addClassPath('../engine');
	KW_ClassLoader::addClassPath('../engine/objects');
	KW_ClassLoader::addClassPath('../engine/handlers');
	KW_ClassLoader::addClassPath('../engine/interfaces');
	KW_ClassLoader::addClassPath('../engine/listeners');

	$system = new KrameSystem();
	$system->getErrorHandler()->addEmailOutputRecipient('kruithne+fquizzes@gmail.com');

	Authenticator::checkLoginKey();

	function nullCheck()
	{
		foreach (func_get_args() as $arg)
			if ($arg === NULL)
				return false;

		return true;
	}
?>