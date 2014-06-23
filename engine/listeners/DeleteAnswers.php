<?php
	class DeleteAnswers extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);

			if (!Authenticator::isLoggedInAsAdmin())
				return;

			$answers = QuizAnswers::get((int) REST::Get('id'));
			if ($answers instanceof QuizAnswers)
			{
				$answers->delete();
				$this->setReturn('success', true);
			}
		}
	}
?>