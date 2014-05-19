<?php
	class QuizPage extends Module
	{
		public function __construct()
		{
			$template = new KW_Template('../templates/quizzes.php');
			parent::__construct('Quizzes', $template);
			$this->addScript('time.js');

			$template->quizzes = Quiz::getAll();
		}
	}
?>