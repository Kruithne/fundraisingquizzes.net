<?php
	class QuizListPacketHandler extends PacketHandler
	{
		protected function run()
		{
			$this->output['quizzes'] = QuizHandler::GetQuizzes();
		}
	}
?>