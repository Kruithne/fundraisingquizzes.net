<?php
	class AnswersPage extends Module
	{
		public function __construct()
		{
			$template = new KW_Template('../templates/answers.php');
			parent::__construct('Answers', $template);
			$this->addStylesheet('quizzes.css');
			$this->addScript('formatting.js');
			$this->addScript('time.js');
			$this->addScript('answers.js');
			$this->addScript('quizzes.js');

			$template->answers = QuizAnswers::getAll();
		}
	}
?>