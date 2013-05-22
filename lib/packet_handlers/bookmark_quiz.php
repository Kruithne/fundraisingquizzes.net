<?php
	class BookmarkQuizPacketHandler extends PacketHandler
	{
		protected function run()
		{
			$quiz = REST::Get('quiz');
			$this->output['result'] = 0;

			if ($quiz !== null)
			{
				$this->output['quiz'] = $quiz;
				if (QuizHandler::HasQuizBookmarked($quiz))
				{
					QuizHandler::RemoveBookmark($quiz);
					$this->output['result'] = 1;
				}
				else
				{
					QuizHandler::BookmarkQuiz($quiz);
					$this->output['result'] = 2;
				}
			}
		}
	}
?>