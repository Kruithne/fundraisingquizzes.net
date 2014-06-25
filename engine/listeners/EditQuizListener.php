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

			$quiz = Quiz::get((int) REST::Get('id'));
			if ($quiz instanceof Quiz && REST::Check($title, $charity, $description, $extra, $closing))
			{
				$quiz->setTitle($title);
				$quiz->setCharity($charity);
				$quiz->setDescription($description);
				$quiz->setExtra($extra);
				$quiz->setClosing($closing);
				$quiz->persist();
				$this->setReturn('success', true);
			}
		}
	}
?>