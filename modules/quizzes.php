<?php
	class QuizzesPage extends Module
	{
		public function Build()
		{
			$this->content = new Template('../templates/quizzes.php');
			$this->title = 'Quizzes';
		}
	}
?>