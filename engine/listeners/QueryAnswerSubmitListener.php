<?php
	class QueryAnswerSubmitListener extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);
			if (!Authenticator::isLoggedIn())
				return;

			$queryID = (int) REST::Get('id');
			$answer = REST::Get('answer');

			if ($queryID > 0 && $answer != null)
			{
				QueryHandler::addQueryAnswer($queryID, $answer);
				$this->setReturn('success', true);
			}
		}
	}
?>