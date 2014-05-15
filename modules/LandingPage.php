<?php
	class LandingPage extends SiteModule
	{
		public function __construct()
		{
			$template = new KW_Template('../templates/landing.php');
			parent::__construct('Home', $template);

			$template->test = Settings::get('weeklyQuiz');
		}
	}
?>