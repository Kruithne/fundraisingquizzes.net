<?php
	class QuizPage extends Module
	{
		public function __construct()
		{
			$template = new KW_Template('../templates/quizzes.php');
			parent::__construct('Quizzes', $template);
			$this->addStylesheet('quizzes.css');
			$this->addScript('time.js');
			$this->addScript('link_parsing.js');
			$this->addScript('quizzes.js');

			$template->quizzes = Quiz::getAll(!Authenticator::isLoggedIn());
		}
	}
?>