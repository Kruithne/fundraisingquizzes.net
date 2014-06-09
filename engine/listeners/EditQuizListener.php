<?php
	class EditQuizListener extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);
			if (!Authenticator::isLoggedInAsAdmin())
				return;

			$id = REST::Get('id', FILTER_VALIDATE_INT);
			$title = REST::Get('title', FILTER_SANITIZE_SPECIAL_CHARS);
			$charity = REST::Get('charity', FILTER_SANITIZE_SPECIAL_CHARS);
			$description = REST::Get('description', FILTER_SANITIZE_SPECIAL_CHARS);
			$extra = REST::Get('extra', FILTER_SANITIZE_SPECIAL_CHARS);
			$closing = REST::Get('closing');

			if ($id !== FALSE && REST::Check($title, $charity, $description, $extra, $closing))
			{
				$quiz = Quiz::get($id);
				if ($quiz instanceof Quiz)
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
	}
?>