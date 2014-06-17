<?php
	class VoteQuizListener extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);

			if (!Authenticator::isLoggedIn())
				return;

			$quiz = Quiz::get((int) REST::Get('id'));
			if ($quiz instanceof Quiz)
			{
				VoteHandler::castVote($quiz);
				$this->setReturn('success', true);
			}
		}
	}
?>