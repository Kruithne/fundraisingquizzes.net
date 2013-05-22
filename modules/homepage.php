<?php
	class HomePage extends Module
	{
		public function Build()
		{
			$this->content = new Template('../templates/homepage.php');
			$this->title = 'Homepage';

			$this->content->weeklyQuiz = QuizHandler::GetWeeklyQuiz();
		}
	}
?>