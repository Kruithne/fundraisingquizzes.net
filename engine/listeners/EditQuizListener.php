<?php
	class EditQuizListener extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);
			if (!Authenticator::isLoggedInAsAdmin())
				return;

			$title = REST::Get('title');
			$charity = REST::Get('charity');
			$description = REST::Get('description');
			$extra = REST::Get('extra');
			$closing = REST::Get('closing');
			$quizType = REST::Get('quizType');

			$quiz = Quiz::get((int) REST::Get('id'));
			if ($quiz instanceof Quiz && REST::Check($title, $charity, $description, $closing))
			{
				$quiz->setTitle($title);
				$quiz->setCharity($charity);
				$quiz->setDescription($description);

				if ($extra !== NULL)
					$quiz->setExtra($extra);

				$quiz->setClosing($closing);
				$quiz->setQuizType($quizType);
				$quiz->persist();
				$this->setReturn('success', true);
			}
		}
	}
?>