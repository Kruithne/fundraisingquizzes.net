<?php
	class SettingsPage extends Module
	{
		public function __construct()
		{
			$template = new KW_Template('../templates/settings.php');
			parent::__construct('Settings', $template);
			$this->addStylesheet('settings.css');
			$this->addScript('time.js');
			$this->addScript('settings.js');

			$template->user = Authenticator::getLoggedInUser();
		}
	}
?>