<?php
	class EditAnswers extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);
			if (!Authenticator::isLoggedInAsAdmin())
				return;

			$answer_set = QuizAnswers::get((int) REST::Get('id'));
			if ($answer_set instanceof QuizAnswers)
			{
				$title = REST::Get('title');
				$charity = REST::Get('charity');
				$closed = REST::Get('closing');
				$answers = REST::Get('answers');

				if ($title !== NULL && $charity !== NULL && $closed !== NULL && $answers !== NULL)
				{
					$answer_set->setTitle($title);
					$answer_set->setCharity($charity);
					$answer_set->setClosed($closed);
					$answer_set->setAnswers($answers);
					$answer_set->persist();

					$this->setReturn('success', true);
				}
			}
		}
	}
?>