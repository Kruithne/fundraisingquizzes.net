<?php
	class BookmarkQuizListener extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);

			if (!Authenticator::isLoggedIn())
				return;

			$quiz = Quiz::get((int) REST::Get('id'));
			if ($quiz instanceof Quiz)
			{
				BookmarkHandler::bookmarkQuiz($quiz);
				$this->setReturn('success', true);
			}
		}
	}
?>