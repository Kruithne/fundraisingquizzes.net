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
		13 => 'RecoverAccount',
		14 => 'ResetPassword',
		15 => 'DeleteSiteLink',
		16 => 'EditSiteLink',
		17 => 'ApproveAnswers',
		18 => 'DeleteAnswers',
		19 => 'EditAnswers',
		20 => 'AddAnswers',
		21 => 'RestoreQuiz'
	));
?>