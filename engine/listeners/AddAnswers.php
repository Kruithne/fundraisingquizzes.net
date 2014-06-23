<?php
	class AddAnswers extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);

			if (!Authenticator::isLoggedIn())
				return;

			$title = REST::Get('title');
			$charity = REST::Get('charity');
			$closed = REST::Get('closing');
			$answers = REST::Get('answers');

			if (REST::Check($title, $charity, $answers, $closed))
			{
				QuizAnswers::create($title, $charity, $closed, $answers, (int) Authenticator::isLoggedInAsAdmin(), Authenticator::getLoggedInUser()->getId());
				$this->setReturn('success', true);
			}
		}
	}
?>