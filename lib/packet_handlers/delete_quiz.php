<?php
	class DeleteQuizPacketHandler extends RestrictedPacketHandler
	{
		public function run()
		{
			$quiz = REST::Get('quiz');
			if ($quiz !== null)
			{
				$query = DB::prepare('DELETE FROM quizzes WHERE ID = :quiz');
				$query->bindValue(':quiz', $quiz);
				$query->execute();
				$this->output['quiz'] = $quiz;
			}
		}
	}
?>