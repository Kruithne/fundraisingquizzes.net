<?php
	session_start(); // Start the PHP session

	require_once('constants.php'); // Constants
	require_once('class_loader.php'); // Dynamic class loader

	ClassLoader::registerClass('DB', 'database.php');
	ClassLoader::registerClass('REST', 'rest_handler.php');
	ClassLoader::registerClass('Session', 'session_handler.php');
	ClassLoader::registerClass('Transporter', 'transporter.php');
	ClassLoader::registerClass('Module', 'module.php');
	ClassLoader::registerClass('MemberModule', 'member_module.php');
	ClassLoader::registerClass('RestrictedModule', 'restricted_module.php');
	ClassLoader::registerClass('Template', 'template.php');
	ClassLoader::registerClass('Authenticator', 'authenticator.php');
	ClassLoader::registerClass('PacketHandler', 'packet_handler.php');
	ClassLoader::registerClass('RestrictedPacketHandler', 'restricted_packet_handler.php');
	ClassLoader::registerClass('UserHandler', 'user_handler.php');
	ClassLoader::registerClass('QuizHandler', 'quiz_handler.php');
	ClassLoader::registerClass('VoteHandler', 'vote_handler.php');
	ClassLoader::registerClass('AccountFlags', 'account_flags.php');
	ClassLoader::registerClass('Settings', 'settings.php');
	ClassLoader::registerClass('DataSanitizer', 'data_sanitizer.php');

	ClassLoader::registerClass('IModule', 'interfaces/IModule.php');

	spl_autoload_register('ClassLoader::loadClass');
?>