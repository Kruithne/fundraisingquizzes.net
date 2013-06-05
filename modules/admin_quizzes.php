<?php
	class AdminQuizzesPage extends RestrictedModule
	{
		public function Build()
		{
			$this->content = new Template('../templates/admin_quizzes.php');
			$this->title = 'Quiz Management';

			$this->content->quizList = QuizHandler::GetQuizList();
		}
	}
?>