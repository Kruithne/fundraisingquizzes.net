<?php
	class LoginPage extends Module
	{
		public function Build()
		{
			// If we're logged in, don't show the login page, redirect to homepage.
			if (Authenticator::IsLoggedIn())
				Transporter::Transport('index.php');

			$this->content = new Template('../templates/login.php');
			$this->title = 'Log-in or register';
		}
	}
?>