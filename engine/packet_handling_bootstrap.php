<?php
	PacketHandler::registerListeners(Array(
		1 => 'LoginListener',
		2 => 'EditQuizListener',
		3 => 'AddQuizListener',
		4 => 'ApproveQuizListener',
	));
?>