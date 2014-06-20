<?php
	PacketHandler::registerListeners(Array(
		1 => 'LoginListener',
		2 => 'EditQuizListener',
		3 => 'AddQuizListener',
		4 => 'ApproveQuizListener',
		5 => 'DeleteQuizListener',
		6 => 'VoteQuizListener',
		7 => 'GetQuizData',
		8 => 'BookmarkQuizListener',
		9 => 'QuerySubmitListener',
		10 => 'QueryAnswerSubmitListener',
		11 => 'DeleteQueryListener',
		12 => 'RegisterAccountListener',
		13 => 'RecoverAccount'
	));
?>