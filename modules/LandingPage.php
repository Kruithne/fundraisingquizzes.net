<?php
	class LandingPage extends Module
	{
		public function __construct()
		{
			$template = new KW_Template('../templates/landing.php');
			parent::__construct('Home', $template);
			$this->addStylesheet('landing.css');

			$template->weeklyQuiz = Quiz::getWeekly();
		}
	}
?>