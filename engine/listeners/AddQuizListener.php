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

			if (REST::Check($title, $charity, $description, $closing))
			{
				$quiz = new Quiz($title, $charity, $description, $extra == null ? '' : $extra, $closing, Authenticator::isLoggedInAsAdmin(), 0);
				$quiz->persist();
				$this->setReturn('success', true);
			}
		}
	}
?>