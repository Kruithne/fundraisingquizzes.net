<?php
	class AddQuizListener extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);

			if (!Authenticator::isLoggedIn())
				return;

			$title = REST::Get('title');
			$charity = REST::Get('charity');
			$description = REST::Get('description');
			$extra = REST::Get('extra');
			$closing = REST::Get('closing');
			$quizType = intval(REST::Get('quizType'));

			if (REST::Check($title, $charity, $description, $closing) && isset(Quiz::$QUIZ_TYPES[$quizType]))
			{
				$closing = strtotime($closing);
				$user_id = Authenticator::getLoggedInUser()->getId();
				$quiz = new Quiz($title, $charity, $description, $extra == null ? '' : $extra, $closing, $user_id, $quizType, 0, Authenticator::isLoggedInAsAdmin(), 0);
				$quiz->persist();
				$this->setReturn('success', true);
			}
		}
	}
?>