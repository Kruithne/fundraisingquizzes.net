<?php
	class RegisterPage extends Module
	{
		public function __construct()
		{
			$template = new KW_Template('../templates/register.php');
			parent::__construct('Register', $template);
			$this->addStylesheet('register.css');
			$this->addScript('register.js');
		}
	}
?>