<?php
	PacketHandler::registerListeners(
		Array(1, 'LoginListener'),
		Array(2, 'EditQuizListener'),
		Array(3, 'AddQuizListener')
	);
?>