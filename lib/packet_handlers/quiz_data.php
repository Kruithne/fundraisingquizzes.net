<?php
	class QuizDataPacketHandler extends RestrictedPacketHandler
	{
		public function run()
		{
			$quiz_id = REST::Get('quiz');

			if ($quiz_id != null)
				$this->output['quiz'] = QuizHandler::GetQuizData($quiz_id);
		}
	}
?>