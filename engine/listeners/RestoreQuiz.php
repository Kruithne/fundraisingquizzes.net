<?php
	class RestoreQuiz extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);
			if (!Authenticator::isLoggedInAsAdmin())
				return;

			$quiz = Quiz::get((int) REST::Get('id'));
			if ($quiz instanceof Quiz)
			{
				$quiz->delete(true);
				$this->setReturn('success', true);
			}
		}
	}
?>