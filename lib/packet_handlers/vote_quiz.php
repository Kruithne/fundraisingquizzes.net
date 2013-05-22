<?php
	class VoteQuizPacketHandler extends PacketHandler
	{
		protected function run()
		{
			$this->output['result'] = 0;
			$quiz = REST::Get('quiz');

			if (is_numeric($quiz))
			{
				if (VoteHandler::GetVoteCount() < MAX_QUIZ_VOTES)
				{
					VoteHandler::VoteForQuiz($quiz);
					$this->output['result'] = 1;
					$this->output['quiz'] = $quiz;
				}
				else
				{
					$this->output['result'] = 2;
				}
			}
		}
	}
?>