<?php
	class ApproveQuizListener extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);
			if (!Authenticator::isLoggedInAsAdmin())
				return;

			$quiz = Quiz::get(intval(REST::Get('id')));

			if ($quiz instanceof Quiz)
			{
				$quiz->setAccepted(true);
				$quiz->persist();
				$this->setReturn('success', true);
			}
		}
	}
?>