<?php
	class QueryAnswerSubmitListener extends PacketListener
	{
		public function run()
		{
			$this->setReturn('success', false);
			if (!Authenticator::isLoggedIn())
				return;

			$queryID = (int) REST::Get('id');
			$answer = REST::Get('answer');

			if ($queryID > 0 && $answer != null)
			{
				$query = DB::get()->prepare('UPDATE quiz_queries SET answer = :answer, answer_user = :user WHERE queryID = :id');
				$query->setValue(':answer', $answer);
				$query->setValue(':user', Authenticator::getLoggedInUser()->getId());
				$query->setValue(':id', $queryID);
				$query->execute();

				$query = DB::get()->prepare('UPDATE quizzes SET updated_flag = :flag WHERE ID = (SELECT quizID FROM quiz_queries WHERE queryID = :id)');
				$query->setValue(':flag', Quiz::DEFAULT_UPDATE_FLAG);
				$query->setValue(':id', $queryID);
				$query->execute();

				$this->setReturn('success', true);
			}
		}
	}
?>