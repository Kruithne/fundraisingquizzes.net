<?php
	class EditQuizListener extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);
			if (!Authenticator::isLoggedInAsAdmin())
				return;

			$id = REST::Get('id', FILTER_VALIDATE_INT);
			$title = REST::Get('title');
			$charity = REST::Get('charity');
			$description = REST::Get('description');
			$extra = REST::Get('extra');
			$closing = REST::Get('closing');

			if ($id !== FALSE && nullCheck($title, $charity, $description, $extra, $closing))
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