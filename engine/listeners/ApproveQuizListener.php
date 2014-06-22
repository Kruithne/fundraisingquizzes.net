<?php
	class ApproveQuizListener extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);
			if (!Authenticator::isLoggedInAsAdmin())
				return;

			$quiz = Quiz::get((int) REST::Get('id'));

			if ($quiz instanceof Quiz)
			{
				$quiz->setAccepted(true);
				$quiz->persist();
				$this->setReturn('success', true);

				$submitter = UserHandler::getUser($quiz->getSubmittedBy());
				if ($submitter instanceof User)
				{
					EmailHandler::sendEmail($submitter, 'Quiz Submission Accepted', 'quiz_approved.txt', Array(
						'{quiz}' => $quiz->getTitle()
					));
				}
			}
		}
	}
?>